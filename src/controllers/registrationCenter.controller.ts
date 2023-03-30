import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrationCenterService } from '../services/registrationCenter.service';
import { RegistrationCenter } from '../schemas/registrationCenter.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';

@Controller('registration-center')
export class RegistrationCenterController {
  constructor(private registrationCenterService: RegistrationCenterService) {}

  @Post()
  async create(@Body() data: IRegistrationCenter): Promise<RegistrationCenter> {
    return this.registrationCenterService.create(data);
  }
  @Get()
  async findAll(): Promise<RegistrationCenter[]> {
    return this.registrationCenterService.findAll();
  }
}
