import { Test, TestingModule } from '@nestjs/testing';
import { GaliciaHttpModule } from '@node-capabilities/http';
import { LoggingModule } from '@node-capabilities/logging';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

describe('ApiController', () => {
  let controller: ApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [ApiService],
      imports: [
        LoggingModule.forRoot({
          isDev: true,
          level: 'info',
        }),
        GaliciaHttpModule.noTracing(),
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
