import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RegistrationDepService } from './registration-dep.service';
import { IRegistrationDep } from '../interfaces/registrationDep.interface';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('registration-dep')
export class RegistrationDepController {
  constructor(private registrationDepService: RegistrationDepService) {}

  @Get('gen-fake-data')
  async genFakeData(): Promise<void> {
    await this.registrationDepService.genFakeData();
  }

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationDepService.findAll());
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @Get('profile')
  async getProfile(@Req() req, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationDepService.getProfile(req));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post('profile')
  async updateProfile(
    @Req() req,
    @Res() res,
    @Body() data: IRegistrationDep,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.registrationDepService.updateProfile(req, data));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Post()
  async create(@Body() data: IRegistrationDep, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationDepService.create(data));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }

  @Delete('delete-all-fake-data')
  async deleteAllFakeData(): Promise<void> {
    await this.registrationDepService.deleteAllFakeData();
  }

  @Delete(':id')
  async deleteById(@Param('id') id, @Res() res): Promise<void> {
    try {
      await this.registrationDepService.deleteById(id);
      res.status(200).json('Department deleted');
    } catch (error) {
      res.status(404).json('Error deleting department');
    }
  }
}
