import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCenterService } from './registration-center.service';

describe('RegistrationCenterService', () => {
  let service: RegistrationCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationCenterService],
    }).compile();

    service = module.get<RegistrationCenterService>(RegistrationCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
