import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsNumber,
  IsObject,
  IsEnum
} from 'class-validator';

export enum LogServiceLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',  // 👈 Con WARNING (no WARN)
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class LogServiceLogDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  cameraID: string;  // 👈 Con mayúscula (como lo envía log-service)

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsEnum(LogServiceLevel)
  level: LogServiceLevel;  // 👈 Acepta WARNING

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;  // 👈 Acepta metadata

  @IsBoolean()
  @IsOptional()
  processed?: boolean;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;
}