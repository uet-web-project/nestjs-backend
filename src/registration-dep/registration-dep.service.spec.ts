import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationDepService } from './registration-dep.service';

describe('RegistrationDepService', () => {
  let service: RegistrationDepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationDepService],
    }).compile();

    service = module.get<RegistrationDepService>(RegistrationDepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
