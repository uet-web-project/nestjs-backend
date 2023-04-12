import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCenterController } from './registration-center.controller';

describe('RegistrationCenterController', () => {
  let controller: RegistrationCenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationCenterController],
    }).compile();

    controller = module.get<RegistrationCenterController>(RegistrationCenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
