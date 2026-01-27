import { IsString, IsDateString, IsEnum } from 'class-validator';

export enum Loglevel {

INFO = 'INFO',
WARN = 'WARN',
ERROR = 'ERROR',
}

export class RawLogDto {
  @IsDateString()
  timestamp: string;

  @IsString()
  cameraId: string;

  @IsEnum(Loglevel)
  level: Loglevel;

  @IsString()
  message: string;
}
