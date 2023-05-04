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
} from '@nestjs/common';
import { RegistrationCenterService } from './registration-center.service';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationCenter } from '../schemas/registration-center.schema';

@Controller('registration-center')
export class RegistrationCenterController {
  constructor(private registrationCenterService: RegistrationCenterService) {}

  @Get('get-fake-data')
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

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<RegistrationCenter> {
    return req.data;
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationCenterService.create(body));
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Delete('delete-all-fake-data')
  async deleteAllFakeData(): Promise<void> {
    await this.registrationCenterService.deleteAllFakeData();
  }

  @UseGuards(AuthGuard)
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
