import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const morgan = require('morgan');


  app.use(morgan('dev'))

  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // lanza error si hay propiedades extra
      transform: true,            // convierte tipos automáticamente (ej: string a number)
    }),
  );

   const PORT = process.env.PORT || 5000;
   await app.listen(PORT);
  console.log(`Log-Transformer corriendo en http://localhost:${PORT}`);
}

bootstrap();
