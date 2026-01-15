import { Test, TestingModule } from '@nestjs/testing';
import { LogTransformerController } from './log-transformer.controller';

describe('LogTransformerController', () => {
  let controller: LogTransformerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogTransformerController],
    }).compile();

    controller = module.get<LogTransformerController>(LogTransformerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
