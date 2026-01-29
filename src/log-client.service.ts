import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LogClientService {
  private readonly logger = new Logger(LogClientService.name);
  // ✅ CORREGIDO: URL correcta del log-service (puerto 4000)
  private readonly LOG_SERVICE_URL = process.env.LOG_SERVICE_URL || 'http://localhost:4000';

  constructor(private readonly httpService: HttpService) {
    this.logger.log(`🔧 Log Service URL configurada: ${this.LOG_SERVICE_URL}`);
  }

  /**
   * 🔍 Obtener logs pendientes (no procesados) desde log-service
   */
  async fetchPendingLogs(limit = 100, cameraId?: string) {
    try {
      this.logger.log(`🔍 Solicitando logs pendientes (limit: ${limit}, cameraID: ${cameraId || 'todos'})`);
      
      const params: any = { limit };
      if (cameraId) {
        params.cameraID = cameraId;
      }

      const url = `${this.LOG_SERVICE_URL}/logs/pending`;
      this.logger.debug(`📡 Llamando a: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log(`✅ Recibidos ${response.data.length} logs pendientes`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo logs pendientes: ${error.message}`);
      this.logger.error(`URL intentada: ${this.LOG_SERVICE_URL}/logs/pending`);
      throw error;
    }
  }

  /**
   * 📅 Obtener logs por rango de fechas desde log-service
   */
  async fetchLogsByDateRange(filters: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    cameraID?: string;
  }) {
    try {
      this.logger.log('📅 Solicitando logs por rango de fechas');
      
      const url = `${this.LOG_SERVICE_URL}/logs/range`;
      const response = await firstValueFrom(
        this.httpService.get(url, { params: filters })
      );

      this.logger.log(`✅ Recibidos ${response.data.length} logs del rango`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo logs por rango: ${error.message}`);
      throw error;
    }
  }

  /**
   * ✔️ Notificar a log-service que logs fueron procesados
   */
  async markLogsAsProcessed(logIds: number[]) {
    try {
      this.logger.log(`✔️ Marcando ${logIds.length} logs como procesados`);
      
      const url = `${this.LOG_SERVICE_URL}/logs/mark-processed`;
      const response = await firstValueFrom(
        this.httpService.post(url, { logIds })
      );

      this.logger.log(`✅ ${logIds.length} logs marcados exitosamente`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error marcando logs como procesados: ${error.message}`);
      throw error;
    }
  }
}