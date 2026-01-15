import { Module } from '@nestjs/common';
import { LogTransformerController } from './log-transformer.controller';
import { LogTransformerService } from './log-transformer.service';

@Module({
  controllers: [LogTransformerController],
  providers: [LogTransformerService]
})
export class LogTransformerModule {}
