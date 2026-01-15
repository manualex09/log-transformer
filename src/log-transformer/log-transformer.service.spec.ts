import { Test, TestingModule } from '@nestjs/testing';
import { LogTransformerService } from './log-transformer.service';

describe('LogTransformerService', () => {
  let service: LogTransformerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogTransformerService],
    }).compile();

    service = module.get<LogTransformerService>(LogTransformerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
