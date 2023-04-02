import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { RegistrationCenterService } from '../services/registrationCenter.service';

@Controller('registration-center')
export class RegistrationCenterController {
  constructor(private registrationCenterService: RegistrationCenterService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    res.status(200).json(await this.registrationCenterService.findAll());
  }

  @Post()
  async create(@Body() body, @Res() res): Promise<void> {
    res.status(200).json(await this.registrationCenterService.create(body));
  }

  @Post('login')
  async login(@Body() body, @Res() res): Promise<void> {
    const response = await this.registrationCenterService.login(body);
    if (typeof response === 'string') {
      res.status(404).json(response);
    }
    res.status(200).json(response);
  }
}