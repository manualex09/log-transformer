import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LogTransformerModule } from './log-transformer/log-transformer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Para los cron jobs
    LogTransformerModule,      // Importa tu módulo aquí
  ],
  controllers: [],  // Vacío - los controllers van en LogTransformerModule
  providers: [],    // Vacío - los services van en LogTransformerModule
})
export class AppModule {}