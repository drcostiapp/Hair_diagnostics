import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ChatRecord {
  id: string;
  match_id: string;
  event_id: string;
  expires_at: Date;
  created_at: Date;
  user_low: string;
  user_high: string;
}

export interface ChatMessageRecord {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: Date;
}

@Injectable()
export class ChatService {
  constructor(private readonly db: DatabaseService) {}

  /** Load a chat with its match participants, or null. */
  async getChat(chatId: string): Promise<ChatRecord | null> {
    return this.db.one<ChatRecord>(
      `SELECT c.*, m.user_low, m.user_high
         FROM chats c
         JOIN matches m ON m.id = c.match_id
        WHERE c.id = $1`,
      [chatId],
    );
  }

  /** Load a chat by its match id. */
  async getChatByMatch(matchId: string): Promise<ChatRecord | null> {
    return this.db.one<ChatRecord>(
      `SELECT c.*, m.user_low, m.user_high
         FROM chats c
         JOIN matches m ON m.id = c.match_id
        WHERE c.match_id = $1`,
      [matchId],
    );
  }

  isParticipant(chat: ChatRecord, userId: string): boolean {
    return chat.user_low === userId || chat.user_high === userId;
  }

  /**
   * Persist a message. Enforces:
   *  - chat exists
   *  - sender is a participant
   *  - chat has not expired (expires_at = event end_time)
   */
  async postMessage(
    chatId: string,
    senderId: string,
    text: string,
  ): Promise<{ message: ChatMessageRecord; chat: ChatRecord }> {
    const chat = await this.getChat(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!this.isParticipant(chat, senderId)) {
      throw new ForbiddenException('Not a participant of this chat');
    }
    if (new Date(chat.expires_at).getTime() <= Date.now()) {
      throw new ForbiddenException('Chat has expired');
    }
    const trimmed = (text ?? '').trim();
    if (!trimmed) {
      throw new ForbiddenException('Message text is required');
    }

    const message = await this.db.one<ChatMessageRecord>(
      `INSERT INTO chat_messages (chat_id, sender_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [chatId, senderId, trimmed],
    );
    return { message: message as ChatMessageRecord, chat };
  }

  async listMessages(
    chatId: string,
    userId: string,
  ): Promise<ChatMessageRecord[]> {
    const chat = await this.getChat(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!this.isParticipant(chat, userId)) {
      throw new ForbiddenException('Not a participant of this chat');
    }
    return this.db.many<ChatMessageRecord>(
      `SELECT * FROM chat_messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [chatId],
    );
  }
}
