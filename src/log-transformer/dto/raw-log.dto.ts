import { IsString, IsDateString, IsIn } from 'class-validator';

export class RawLogDto {
  @IsDateString()
  timestamp: string;

  @IsString()
  cameraId: string;

  @IsIn(['INFO', 'WARN', 'ERROR'])
  level: string;

  @IsString()
  message: string;
}
