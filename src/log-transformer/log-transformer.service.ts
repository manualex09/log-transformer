import { Injectable } from '@nestjs/common';
import { RawLogDto } from './dto/raw-log.dto';

@Injectable()
export class LogTransformerService {
  // Método original - transformación simple
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

  // Método nuevo - transformación detallada
  transformLog(log: RawLogDto) {
    console.log('🔄 Transformando log...');
    
    const logTransformado = {
      id: `LOG-${Date.now()}`,
      timestamp: log.timestamp,
      camera: {
        id: log.cameraId,
        name: `Cámara ${log.cameraId}`,
      },
      severity: this.mapearNivelASeveridad(log.level),
      originalLevel: log.level,
      description: log.message.toUpperCase(),
      originalMessage: log.message,
      processedAt: new Date().toISOString(),
      status: 'PROCESSED',
    };
    
    console.log('✅ Log transformado:', logTransformado);
    return logTransformado;
  }

  private mapearNivelASeveridad(level: string): number {
    const severidades = {
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    return severidades[level] || 0;
  }
}