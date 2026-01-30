import { 
  Controller, 
  Post, 
  Body, 
  Get,
  Logger,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LogTransformerService } from './log-transformer.service.refactored';
import { 
  TransformLogDto, 
  ProcessLogsByCameraDto, 
  ProcessLogsByRangeDto 
} from './dto/transform-log.dto';

@Controller('transform')
export class LogTransformerController {
  private readonly logger = new Logger(LogTransformerController.name);

  constructor(
    private readonly transformerService: LogTransformerService
  ) {}

  /**
   * POST /transform/transform
   * Transformar un log individual recibido directamente
   */
  @Post('transform')
  @HttpCode(HttpStatus.OK)
  transformSingleLog(@Body() dto: TransformLogDto) {
    this.logger.log('POST /transform/transform');
    
    const transformed = this.transformerService.transformSingleLog(dto);
    
    return {
      success: true,
      log: transformed,
    };
  }

  /**
   * POST /transform/process
   * Procesar logs de una cámara específica (llama al extractor)
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processLogs(@Body() dto: ProcessLogsByCameraDto) {
    this.logger.log(`POST /transform/process - Camera: ${dto.cameraId}`);
    
    const transformed = await this.transformerService.processCameraLogs(dto.cameraId);
    const stats = this.transformerService.getStatistics(transformed);
    
    return {
      success: true,
      cameraId: dto.cameraId,
      statistics: stats,
      logs: transformed,
    };
  }

  /**
   * POST /transform/process-range
   * Procesar logs en un rango de fechas (llama al extractor)
   */
  @Post('process-range')
  @HttpCode(HttpStatus.OK)
  async processRange(@Body() dto: ProcessLogsByRangeDto) {
    this.logger.log(`POST /transform/process-range - ${dto.start} to ${dto.end}`);
    
    const transformed = await this.transformerService.processLogsByRange(
      dto.start,
      dto.end,
      dto.cameraId
    );
    
    const stats = this.transformerService.getStatistics(transformed);
    
    return {
      success: true,
      range: {
        start: dto.start,
        end: dto.end,
        cameraId: dto.cameraId || 'all'
      },
      statistics: stats,
      logs: transformed,
    };
  }

  /**
   * GET /transform/status
   * Estado del servicio de transformación
   */
  @Get('status')
  getStatus() {
    this.logger.log('GET /transform/status');
    
    return {
      service: 'log-transformer',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      extractorUrl: process.env.EXTRACTOR_URL || 'http://localhost:4000',
    };
  }
}