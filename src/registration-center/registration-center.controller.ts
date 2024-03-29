import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Delete,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { RegistrationCenterService } from './registration-center.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('registration-center')
export class RegistrationCenterController {
  constructor(private registrationCenterService: RegistrationCenterService) {}

  @Get('gen-fake-data')
  async genFakeData(): Promise<void> {
    await this.registrationCenterService.genFakeData();
  }

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationCenterService.findAll());
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Get('get-by-dep-id/:depId')
  async findByDepId(@Param('depId') depId, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.registrationCenterService.findByDepId(depId));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Get('profile')
  async getProfile(@Req() req, @Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.registrationCenterService.getProfile(req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('profile')
  async updateProfile(@Req() req, @Res() res, @Body() body): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.registrationCenterService.updateProfile(req, body));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post()
  async create(@Body() body, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationCenterService.create(body));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Patch('update-full-address')
  async updateFullAddress(@Res() res): Promise<void> {
    try {
      res
        .status(200)
        .json(
          await this.registrationCenterService.updateAllCenterFullAddress(),
        );
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Delete('delete-all-fake-data')
  async deleteAllFakeData(): Promise<void> {
    await this.registrationCenterService.deleteAllFakeData();
  }

  @Delete(':id')
  async deleteById(@Param('id') id, @Res() res): Promise<void> {
    try {
      await this.registrationCenterService.deleteById(id);
      res.status(200).json('Center deleted');
    } catch (error) {
      res.status(404).json('Error deleting center');
    }
  }
}
