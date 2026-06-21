import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { MlService } from './ml.service';

/**
 * Thin authenticated passthroughs to the ML service.
 */
@Controller('ml')
@UseGuards(JwtAuthGuard)
export class MlController {
  constructor(private readonly ml: MlService) {}

  private async proxy(path: string, body: any) {
    try {
      return await this.ml.forward(path, body);
    } catch (err: any) {
      const status =
        err?.response?.status ?? HttpStatus.BAD_GATEWAY;
      const data = err?.response?.data ?? {
        message: 'ML service unavailable',
      };
      throw new HttpException(data, status);
    }
  }

  @Post('rank')
  rank(@Body() body: any) {
    return this.proxy('/ml/rank', body);
  }

  @Post('train')
  train(@Body() body: any) {
    return this.proxy('/ml/train', body);
  }

  @Post('features')
  features(@Body() body: any) {
    return this.proxy('/ml/features', body);
  }
}
