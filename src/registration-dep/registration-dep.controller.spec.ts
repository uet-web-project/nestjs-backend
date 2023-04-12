import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationDepController } from './registration-dep.controller';

describe('RegistrationDepController', () => {
  let controller: RegistrationDepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationDepController],
    }).compile();

    controller = module.get<RegistrationDepController>(RegistrationDepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
