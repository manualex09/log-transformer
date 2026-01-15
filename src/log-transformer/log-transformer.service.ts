import { Injectable } from '@nestjs/common';
import { RawLogDto } from './dto/raw-log.dto';

@Injectable()
export class LogTransformerService {
  transform(log: RawLogDto) {
    return {
      fecha: new Date(log.timestamp).toLocaleString(),
      camara: `📷 Cámara ${log.cameraId}`,
      nivel:
        log.level === 'ERROR'
          ? '🔴 ERROR'
          : log.level === 'WARN'
          ? '🟡 ADVERTENCIA'
          : '🟢 INFO',
      descripcion: log.message,
    };
  }
}
