import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { MlModule } from '../ml/ml.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [TicketsModule, MlModule, GatewayModule],
  providers: [SocialService],
  controllers: [SocialController],
})
export class SocialModule {}
