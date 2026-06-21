import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [EventsGateway, ChatService],
  controllers: [ChatController],
  exports: [EventsGateway, ChatService],
})
export class GatewayModule {}
