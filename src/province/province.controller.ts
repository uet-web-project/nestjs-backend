import { Controller, Get, Res } from '@nestjs/common';
import { ProvinceService } from './province.service';

@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getProvinces(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.provinceService.getProvinces());
    } catch (err) {
      res.status(err.status || 404).json('Error getting provinces');
    }
  }
}
