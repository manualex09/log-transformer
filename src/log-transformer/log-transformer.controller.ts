import { Controller, Post, Body } from '@nestjs/common';
import { LogTransformerService } from './log-transformer.service';
import { RawLogDto } from './dto/raw-log.dto';

@Controller('log-transformer')
export class LogTransformerController {
  constructor(
    private readonly logTransformerService: LogTransformerService,
  ) {}

  @Post('extractlogs')
  transform(@Body() log: RawLogDto) {
    return this.logTransformerService.transform(log);
  }
} 