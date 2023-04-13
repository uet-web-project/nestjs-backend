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

@Controller('registration-dep')
export class RegistrationDepController {
  constructor(private registrationDepService: RegistrationDepService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationDepService.findAll());
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<IRegistrationDep> {
    return req.data;
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() data: IRegistrationDep, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.registrationDepService.create(data));
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('login')
  async login(@Body() data: IRegistrationDep, @Res() res): Promise<void> {
    try {
      const response = await this.registrationDepService.login(data);
      if (typeof response === 'string') {
        res.status(404).json(response);
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(404).json(error);
    }
  }

  @UseGuards(AuthGuard)
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
