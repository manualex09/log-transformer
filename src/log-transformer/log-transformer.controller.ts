import { Controller, Post, Body, Get,  } from '@nestjs/common';
import { LogTransformerService } from './log-transformer.service';
import { RawLogDto } from './dto/raw-log.dto';

@Controller('transform')
export class LogTransformerController {
  constructor(
    private readonly logTransformerService: LogTransformerService,
  ) {}

  // ==========================================
  // ✅ TU ENDPOINT ORIGINAL - SE MANTIENE
  // ==========================================

  /**
   * POST /transform
   * Endpoint original: Recibe un log y lo transforma inmediatamente
   */
  @Post()
  transform(@Body() log: RawLogDto) {
    return this.logTransformerService.transformLog(log);
  }

  // ==========================================
  // 🆕 NUEVOS ENDPOINTS - Solicitar logs del log-service
  // ==========================================

  /**
   * POST /transform/process
   * Procesa logs pendientes del log-service manualmente
   * Ejemplo: POST http://localhost:5000/transform/process
   * Opcional: POST http://localhost:5000/transform/process?cameraID=server1
   */
  @Post('process')
 async processLogs(@Body() body?: { cameraID?: string }) {
    return await this.logTransformerService.processLogs(body?.cameraID);
  }

  /**
   * POST /transform/process-range
   * Procesa logs por rango de fechas
   * Body: {
   *   "startDate": "2024-01-01",
   *   "endDate": "2024-01-31",
   *   "serverName": "server1" (opcional)
   * }
   */
  @Post('process-range')
  async processLogsByDateRange(
    @Body() body: { startDate: string; endDate: string; cameraID?: string }
  ) {
    return await this.logTransformerService.processLogsByDateRange(body);
  }

  /**
   * GET /transform/status
   * Ver estado del transformer
   */
  @Get('status')
  getStatus() {
    return {
      status: 'running',
      service: 'log-transformer',
      version: '1.0.0',
      message: 'Transformer está activo. Procesa logs automáticamente cada 5 minutos.',
      endpoints: {
        transform: 'POST /transform - Transforma un log individual',
        process: 'POST /transform/process - Procesa logs pendientes del log-service',
        processRange: 'POST /transform/process-range - Procesa logs por fecha',
        status: 'GET /transform/status - Ver estado del servicio',
      },
    };
  }
}