import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { Vehicle } from '../schemas/vehicle.schema';

@Controller('vehicle')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    res.status(200).json(await this.vehicleService.findAll());
  }

  @Post()
  async create(@Body() body, @Res() res): Promise<void> {
    const response = await this.vehicleService.create(body);
    if (response) {
      res.status(200).json(response);
    }
    res.status(404).json('Error adding vehicle');
  }

  @Post('many')
  async createMany(@Body() body, @Res() res): Promise<void> {
    await this.vehicleService.createMany(body);
    res.status(200).json('Success');
  }
}
