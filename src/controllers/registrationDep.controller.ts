import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrationDepService } from '../services/registryDep.service';
import { RegistrationDep } from '../schemas/registrationDep.schema';
import { IRegistrationDep } from '../interfaces/registrationDep.interface';

@Controller('registration-dep')
export class RegistrationDepController {
  constructor(private registrationDepService: RegistrationDepService) {}

  @Post()
  async create(@Body() data: IRegistrationDep): Promise<RegistrationDep> {
    return this.registrationDepService.create(data);
  }

  @Get()
  async findAll(): Promise<RegistrationDep[]> {
    return this.registrationDepService.findAll();
  }
}
