import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LogTransformerController } from './log-transformer.controller';
import { LogTransformerService } from './log-transformer.service';
import { LogClientService } from '../log-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      proxy: false, // ✅ CRÍTICO: Desactiva el proxy para localhost
    }),
  ],
  controllers: [LogTransformerController], // Aquí van los controllers
  providers: [LogTransformerService, LogClientService], // Aquí van los services
  exports: [LogTransformerService],
})
export class LogTransformerModule {}