import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { Vehicle } from '../schemas/vehicle.schema';

@Controller('vehicle')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    res.status(200).json(await this.vehicleService.findAll());
  }

  @Get('expired')
  async findExpired(@Res() res): Promise<void> {
    res.status(200).json(await this.vehicleService.findExpired());
  }

  @Get('get-by-registration-center/:id')
  async findByRegistrationCenter(@Param('id') id, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.findByRegistrationCenter(id));
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Get('get-by-vehicle-type/:vehicleType')
  async findByVehicleType(
    @Param('vehicleType') vehicleType,
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.findByVehicleType(vehicleType));
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Post()
  async create(@Body() body, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.vehicleService.create(body));
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Post('many')
  async createMany(@Body() body, @Res() res): Promise<void> {
    await this.vehicleService.createMany(body);
    res.status(200).json('Success');
  }

  @Delete(':id')
  async deleteById(@Param('id') id, @Res() res): Promise<void> {
    try {
      await this.vehicleService.deleteById(id);
      res.status(200).json('Vehicle deleted');
    } catch (error) {
      res.status(404).json(error);
    }
  }
}
