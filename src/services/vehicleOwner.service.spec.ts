import { Test, TestingModule } from '@nestjs/testing';
import { VehicleOwnerService } from './vehicleOwner.service';

describe('VehicleOwnerService', () => {
  let service: VehicleOwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleOwnerService],
    }).compile();

    service = module.get<VehicleOwnerService>(VehicleOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
