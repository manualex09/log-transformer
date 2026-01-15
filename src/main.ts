import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'))

  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // lanza error si hay propiedades extra
      transform: true,            // convierte tipos automáticamente (ej: string a number)
    }),
  );

   const port = process.env.PORT || 3000;
   await app.listen(port);
  console.log(`Log-Transformer corriendo en http://localhost:${port}`);
}

bootstrap();
