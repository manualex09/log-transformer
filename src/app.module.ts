import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogTransformerModule } from './log-transformer/log-transformer.module';
import { ConfigModule } from "@nestjs/config";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
      envFilePath: '.env',
  }),
     LogTransformerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
