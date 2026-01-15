import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogTransformerModule } from './log-transformer/log-transformer.module';

@Module({
  imports: [LogTransformerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
