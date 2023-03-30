import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterSchema,
} from '../schemas/registrationCenter.schema';
import { RegistrationCenterService } from '../services/registrationCenter.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationCenter.name, schema: RegistrationCenterSchema },
    ]),
  ],
  providers: [RegistrationCenterService],
})
export class RegistrationCenterModule {}
