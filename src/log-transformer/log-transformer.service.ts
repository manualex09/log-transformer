import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RawLogDto } from './dto/raw-log.dto';
import { LogServiceLogDto } from './dto/log-service-log.dto';

@Injectable()
export class LogTransformerService {
  private readonly logger = new Logger(LogTransformerService.name);
  private readonly LOG_SERVICE_URL = 'http://localhost:4000';

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`🔗 Log Service URL: ${this.LOG_SERVICE_URL}`);
  }

  // ==========================================
  // ✅ ENDPOINT DIRECTO: POST /transform
  // Valida con RawLogDto (cameraId, WARN, sin metadata)
  // ==========================================
  async transformLog(log: RawLogDto) {
    this.logger.log(`🔄 Transformando log directo: ${log.cameraId}`);
    
    const transformed = {
      original: log,
      transformed: {
        camera_id: log.cameraId,
        log_level: log.level,
        description: log.message,
        processed_at: new Date().toISOString(),
      }
    };

    return transformed;
  }

  // ==========================================
  // 🔒 MÉTODOS CON VALIDACIÓN
  // ==========================================

  /**
   * Valida un log del log-service con LogServiceLogDto
   */
  private async validateLogFromService(log: any): Promise<LogServiceLogDto> {
    // Convertir objeto plano a instancia de clase
    const logDto = plainToClass(LogServiceLogDto, log);

    // Validar
    const errors = await validate(logDto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      
      this.logger.error(`❌ Error de validación en log ${log.id}: ${errorMessages}`);
      throw new BadRequestException(`Validación fallida: ${errorMessages}`);
    }

    return logDto;
  }

  /**
   * Normaliza el nivel de log: WARNING -> WARN
   */
  private normalizeLogLevel(level: string): string {
    const normalized = level.toUpperCase();
    
    if (normalized === 'WARNING') {
      return 'WARN';
    }
    
    return normalized;
  }

  /**
   * Transforma un log del log-service CON VALIDACIÓN
   */
  private async transformLogFromService(log: any) {
    // 🔒 VALIDAR primero
    const validatedLog = await this.validateLogFromService(log);

    this.logger.log(`🔄 Transformando log validado ID: ${validatedLog.id}`);
    
    const transformed = {
      id: validatedLog.id,
      original: {
        cameraID: validatedLog.cameraID,
        level: validatedLog.level,
        message: validatedLog.message,
        timestamp: validatedLog.timestamp,
        metadata: validatedLog.metadata,
      },
      transformed: {
        camera_id: validatedLog.cameraID,
        log_level: this.normalizeLogLevel(validatedLog.level),
        description: validatedLog.message,
        metadata: validatedLog.metadata || {},
        processed_at: new Date().toISOString(),
        original_timestamp: validatedLog.timestamp,
      },
      validated: true,
    };

    return transformed;
  }

  /**
   * Marca logs como procesados en el log-service
   */
  private async markLogsAsProcessed(logIds: number[]) {
    try {
      const url = `${this.LOG_SERVICE_URL}/logs/mark-processed`;
      
      this.logger.log(`✅ Marcando ${logIds.length} logs como procesados...`);

      await firstValueFrom(
        this.httpService.post(url, { logIds })
      );

      this.logger.log(`✅ ${logIds.length} logs marcados exitosamente`);
    } catch (error) {
      this.logger.error(`❌ Error marcando logs: ${error.message}`);
      throw error;
    }
  }

  // ==========================================
  // 🆕 PROCESAMIENTO AUTOMÁTICO CON VALIDACIÓN
  // ==========================================

  /**
   * Procesa logs pendientes del log-service
   * POST /transform/process
   */
  async processLogs(cameraID?: string) {
    try {
      this.logger.log('📡 Solicitando logs pendientes del log-service...');

      // Construir URL
      let url = `${this.LOG_SERVICE_URL}/logs/pending?limit=100`;
      if (cameraID) {
        url += `&cameraId=${cameraID}`;
      }

      this.logger.log(`🔗 URL: ${url}`);

      // Hacer petición HTTP
      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      this.logger.log(`📥 Respuesta recibida del log-service`);

      // Adaptar formato de respuesta
      let pendingLogs:any[]= [];
      if (Array.isArray(response.data)) {
        pendingLogs = response.data;
      } else if (response.data.logs) {
        pendingLogs = response.data.logs;
      } else if (response.data.data) {
        pendingLogs = response.data.data;
      }

      this.logger.log(`📊 Logs pendientes encontrados: ${pendingLogs.length}`);

      if (pendingLogs.length === 0) {
        return {
          processed: 0,
          failed: 0,
          message: 'No hay logs pendientes para procesar',
        };
      }

      // 🔒 Transformar cada log CON VALIDACIÓN
      const transformedLogs : any[]= [];
      const failedLogs :any[]= [];

      for (const log of pendingLogs) {
        try {
          // 👇 Valida y transforma
          const transformed = await this.transformLogFromService(log);
          transformedLogs.push(transformed);
        } catch (error) {
          this.logger.error(`❌ Error con log ${log.id}: ${error.message}`);
          failedLogs.push({
            id: log.id,
            error: error.message,
          });
        }
      }

      this.logger.log(`✅ Transformados: ${transformedLogs.length}, Fallidos: ${failedLogs.length}`);

      // Marcar logs transformados como procesados
      if (transformedLogs.length > 0) {
        const logIds = transformedLogs
          .filter(log => log && log.id)
          .map(log => log.id);
        
        if (logIds.length > 0) {
          await this.markLogsAsProcessed(logIds);
        }
      }

      return {
        processed: transformedLogs.length,
        failed: failedLogs.length,
        transformedLogs,
        failedLogs: failedLogs.length > 0 ? failedLogs : undefined,
      };

    } catch (error) {
      this.logger.error(`❌ Error procesando logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Procesa logs por rango de fechas
   * POST /transform/process-range
   */
  async processLogsByDateRange(params: {
    startDate: string;
    endDate: string;
    cameraID?: string;
  }) {
    try {
      this.logger.log('📅 Solicitando logs por rango de fechas...');

      // Construir URL
      let url = `${this.LOG_SERVICE_URL}/logs/range?startDate=${params.startDate}&endDate=${params.endDate}&limit=1000`;
      if (params.cameraID) {
        url += `&cameraId=${params.cameraID}`;
      }

      this.logger.log(`🔗 URL: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      // Adaptar formato
      let logs : any[] = [];
      if (Array.isArray(response.data)) {
        logs = response.data;
      } else if (response.data.logs) {
        logs = response.data.logs;
      } else if (response.data.data) {
        logs = response.data.data;
      }

      this.logger.log(`📊 Logs encontrados en rango: ${logs.length}`);

      if (logs.length === 0) {
        return {
          processed: 0,
          failed: 0,
          message: 'No hay logs en el rango especificado',
          dateRange: {
            start: params.startDate,
            end: params.endDate,
          },
        };
      }

      // 🔒 Transformar logs CON VALIDACIÓN
      const transformedLogs :any[]= [];
      const failedLogs :any[]= [];

      for (const log of logs) {
        try {
          const transformed = await this.transformLogFromService(log);
          transformedLogs.push(transformed);
        } catch (error) {
          this.logger.error(`❌ Error con log ${log.id}: ${error.message}`);
          failedLogs.push({
            id: log.id,
            error: error.message,
          });
        }
      }

      this.logger.log(`✅ Transformados: ${transformedLogs.length}, Fallidos: ${failedLogs.length}`);

      // Marcar como procesados
      if (transformedLogs.length > 0) {
        const logIds = transformedLogs
          .filter(log => log && log.id)
          .map(log => log.id);
        
        if (logIds.length > 0) {
          await this.markLogsAsProcessed(logIds);
        }
      }

      return {
        processed: transformedLogs.length,
        failed: failedLogs.length,
        dateRange: {
          start: params.startDate,
          end: params.endDate,
        },
        cameraID: params.cameraID,
        transformedLogs,
        failedLogs: failedLogs.length > 0 ? failedLogs : undefined,
      };

    } catch (error) {
      this.logger.error(`❌ Error procesando logs por rango: ${error.message}`);
      throw error;
    }
  }
}