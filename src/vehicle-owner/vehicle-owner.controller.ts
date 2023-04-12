import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  Param,
} from '@nestjs/common';
import { VehicleOwnerService } from './vehicle-owner.service';
import { IVehicleOwner } from '../interfaces/vehicleOwner.interface';

@Controller('vehicle-owner')
export class VehicleOwnerController {
  constructor(private vehicleOwnerService: VehicleOwnerService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.vehicleOwnerService.findAll());
    } catch (error) {
      res.status(404).json('Error getting owners');
    }
  }

  @Post()
  async create(@Body() body: IVehicleOwner, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.vehicleOwnerService.create(body));
    } catch (error) {
      res.status(404).json('Error creating owner');
    }
  }

  @Delete(':id')
  async deleteById(@Param('id') id, @Res() res): Promise<void> {
    try {
      await this.vehicleOwnerService.deleteById(id);
      res.status(200).json('Owner deleted');
    } catch (error) {
      res.status(404).json('Error deleting owner');
    }
  }
}
