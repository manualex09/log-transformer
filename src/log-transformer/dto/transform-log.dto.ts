import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
export class TransformLogDto {
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  cameraId: string;

  @IsString()
  @IsIn(['INFO', 'WARN', 'WARNING', 'ERROR', 'DEBUG'])
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  raw?: string; // Línea original del archivo
}

export class ProcessLogsByCameraDto {
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export class ProcessLogsByRangeDto {
  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;

  @IsString()
  @IsOptional()
  cameraId?: string;
}