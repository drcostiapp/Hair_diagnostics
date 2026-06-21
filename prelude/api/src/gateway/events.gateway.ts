import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../common/types';
import { ChatService } from './chat.service';

interface AuthedSocket extends Socket {
  userId?: string;
}

function eventRoom(eventId: string) {
  return `event:${eventId}`;
}
function chatRoom(chatId: string) {
  return `chat:${chatId}`;
}
function userRoom(userId: string) {
  return `user:${userId}`;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly chat: ChatService,
  ) {}

  /** Authenticate on connect via handshake auth token or Authorization header. */
  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace(
          /^Bearer\s+/i,
          '',
        );
      if (!token) {
        throw new Error('No token');
      }
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>('jwtSecret'),
      });
      client.userId = payload.sub;
      // Personal room for direct notifications (e.g. match_created).
      client.join(userRoom(payload.sub));
      this.logger.log(`socket connected: user ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`socket auth failed: ${String(err)}`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join_event')
  handleJoinEvent(
    @ConnectedSocket() client: AuthedSocket,
    // Accept either a raw id or the client's `{ event_id }` payload.
    @MessageBody() body: string | { event_id?: string; eventId?: string },
  ) {
    if (!client.userId) throw new WsException('Unauthorized');
    const eventId =
      typeof body === 'string' ? body : body?.event_id ?? body?.eventId;
    if (!eventId) throw new WsException('eventId is required');
    client.join(eventRoom(eventId));
    return { joined: eventRoom(eventId) };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthedSocket,
    // Accept both snake_case (mobile client) and camelCase payloads.
    @MessageBody()
    body: {
      chatId?: string;
      chat_id?: string;
      matchId?: string;
      match_id?: string;
      text: string;
    },
  ) {
    if (!client.userId) throw new WsException('Unauthorized');

    let chatId = body?.chatId ?? body?.chat_id;
    const matchId = body?.matchId ?? body?.match_id;
    if (!chatId && matchId) {
      const chat = await this.chat.getChatByMatch(matchId).catch(() => null);
      if (chat) chatId = chat.id;
    }
    if (!chatId) throw new WsException('chatId is required');

    try {
      const { message } = await this.chat.postMessage(
        chatId,
        client.userId,
        body.text,
      );
      // Make sure the sender's socket is in the chat room for future events.
      client.join(chatRoom(chatId));
      this.server.to(chatRoom(chatId)).emit('new_message', message);
      return { ok: true, message };
    } catch (err: any) {
      throw new WsException(err?.message ?? 'Could not send message');
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() chatId: string,
  ) {
    if (!client.userId) throw new WsException('Unauthorized');
    if (!chatId) throw new WsException('chatId is required');
    client.join(chatRoom(chatId));
    return { joined: chatRoom(chatId) };
  }

  // ---- server-side emitters used by other services ----------------------

  /** Notify both matched users that a match (and chat) was created. */
  notifyMatchCreated(payload: {
    matchId: string;
    chatId: string;
    eventId: string;
    users: [string, string];
    expiresAt: Date | string;
  }) {
    if (!this.server) return;
    for (const uid of payload.users) {
      const peerId = payload.users.find((u) => u !== uid) ?? uid;
      // Match-shaped payload the mobile client consumes (keyed by `id`).
      const match = {
        id: payload.matchId,
        event_id: payload.eventId,
        chat_id: payload.chatId,
        user_id: peerId,
        expires_at: payload.expiresAt,
      };
      this.server.to(userRoom(uid)).emit('new_match', match);
      // Kept for backwards compatibility with non-mobile consumers.
      this.server.to(userRoom(uid)).emit('match_created', payload);
    }
  }

  /** Broadcast a message created out-of-band (e.g. via REST) to a chat room. */
  emitNewMessage(chatId: string, message: unknown) {
    if (!this.server) return;
    this.server.to(chatRoom(chatId)).emit('new_message', message);
  }
}
