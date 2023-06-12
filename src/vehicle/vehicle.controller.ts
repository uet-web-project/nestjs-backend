import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(AuthGuard)
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

  @Get('get-by-registration-dep')
  async findByRegistrationDep(@Req() req, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.findByRegistrationDep(req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Get('get-by-registration-center')
  async findByRegistrationCenter(@Req() req, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.findByRegistrationCenter(req));
    } catch (error) {
      res.status(error.status || 404).json(error);
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
      res.status(error.status || 404).json(error);
    }
  }

  @Get('get-registered-vehicles-count/:filter')
  async getRegisteredVehiclesCount(
    @Param('filter') filter,
    @Req() req,
    @Res() res,
  ) {
    try {
      res
        .status(200)
        .json(
          await this.vehicleService.getRegisteredVehiclesCount(filter, req),
        );
    } catch (error) {
      console.log(error);
      res.status(error.status || 404).json(error);
    }
  }

  @Get('get-near-expired-vehicles')
  async getNearExpiredVehicles(@Req() req, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.getNearExpiredVehicles(req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('get-vehicle-by-filter')
  async getVehicleByFilter(
    @Body() body,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.getVehicleByFilter(body, req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('group-by-vehicle-type')
  async groupByVehicleType(
    @Body() body,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.vehicleService.groupByVehicleType(body, req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('get-vehicles-by-type-and-date-range')
  async getVehiclesByTypeAndDateRange(
    @Body() body,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(
          await this.vehicleService.getVehiclesByTypeAndDateRange(body, req),
        );
    } catch (error) {
      res.status(error.status || 404).json(error);
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

  @Post('create-vehicle-from-certificate')
  async createVehicleFromCertificate(
    @Body() body: { certificate: any },
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(
          await this.vehicleService.createVehicleFromCertificate(
            body.certificate,
          ),
        );
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('upload-vehicles-sheet')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async uploadVehiclesSheet(
    @UploadedFile() file: Express.Multer.File,
    @Res() res,
  ) {
    try {
      res.status(200).json(await this.vehicleService.uploadVehicles(file));
    } catch (err) {
      res.status(err.status || 404).json(err);
    }
  }

  @Delete('delete-all-fake-data')
  async deleteAllFakeData(): Promise<void> {
    await this.vehicleService.deleteAllFakeData();
  }

  @Delete(':id')
  async deleteById(@Param('id') id, @Res() res): Promise<void> {
    try {
      await this.vehicleService.deleteById(id);
      res.status(200).json('Vehicle deleted');
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Get('gen-fake-data')
  async genFakeData(): Promise<void> {
    await this.vehicleService.genFakeData();
  }
}
