import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('provinces')
  async getProvinces(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.appService.getProvinces());
    } catch (err) {
      res.status(err.status || 404).json('Error getting provinces');
    }
  }
}
