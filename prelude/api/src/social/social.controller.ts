import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthedUser } from '../common/types';
import { SocialService } from './social.service';
import { SwipeDto } from './dto/swipe.dto';
import { ReportDto } from './dto/report.dto';
import { BlockDto } from './dto/block.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('feed')
  feed(@CurrentUser() user: AuthedUser, @Query() query: FeedQueryDto) {
    return this.social.feed(user.id, query.event_id);
  }

  @Post('like')
  like(@CurrentUser() user: AuthedUser, @Body() dto: SwipeDto) {
    return this.social.swipe(user.id, dto.event_id, dto.target_user_id, 'like');
  }

  @Post('pass')
  pass(@CurrentUser() user: AuthedUser, @Body() dto: SwipeDto) {
    return this.social.swipe(user.id, dto.event_id, dto.target_user_id, 'pass');
  }

  @Post('superlike')
  superlike(@CurrentUser() user: AuthedUser, @Body() dto: SwipeDto) {
    return this.social.swipe(
      user.id,
      dto.event_id,
      dto.target_user_id,
      'superlike',
    );
  }

  @Get('matches')
  matches(@CurrentUser() user: AuthedUser, @Query() query: FeedQueryDto) {
    return this.social.matches(user.id, query.event_id);
  }

  @Post('report')
  report(@CurrentUser() user: AuthedUser, @Body() dto: ReportDto) {
    return this.social.report(
      user.id,
      dto.event_id,
      dto.target_user_id,
      dto.reason,
    );
  }

  @Post('block')
  block(@CurrentUser() user: AuthedUser, @Body() dto: BlockDto) {
    return this.social.block(user.id, dto.target_user_id);
  }
}
