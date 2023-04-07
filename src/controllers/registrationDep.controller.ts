import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  Param,
} from '@nestjs/common';
import { RegistrationDepService } from '../services/registryDep.service';
import { IRegistrationDep } from '../interfaces/registrationDep.interface';

@Controller('registration-dep')
export class RegistrationDepController {
  constructor(private registrationDepService: RegistrationDepService) {}

  @Get()
  async findAll(@Res() res): Promise<void> {
    res.status(200).json(await this.registrationDepService.findAll());
  }

  @Post()
  async create(@Body() data: IRegistrationDep, @Res() res): Promise<void> {
    res.status(200).json(await this.registrationDepService.create(data));
  }

  @Post('login')
  async login(@Body() data: IRegistrationDep, @Res() res): Promise<void> {
    const response = await this.registrationDepService.login(data);
    if (typeof response === 'string') {
      res.status(404).json(response);
    }
    res.status(200).json(response);
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
