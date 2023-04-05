import { Test, TestingModule } from '@nestjs/testing';
import { VehicleOwnerController } from './vehicleOwner.controller';

describe('VehicleOwnerController', () => {
  let controller: VehicleOwnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleOwnerController],
    }).compile();

    controller = module.get<VehicleOwnerController>(VehicleOwnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
