import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { VehicleOwnerService } from '../services/vehicleOwner.service';
import { IVehicleOwner } from '../interfaces/vehicleOwner.interface';

@Controller('vehicle-owner')
export class VehicleOwnerController {
  constructor(private vehicleOwnerService: VehicleOwnerService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    res.status(200).json(await this.vehicleOwnerService.findAll());
  }

  @Post()
  async create(@Body() body: IVehicleOwner, @Res() res): Promise<void> {
    res.status(200).json(await this.vehicleOwnerService.create(body));
  }
}
