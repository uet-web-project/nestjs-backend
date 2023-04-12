import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterSchema,
} from '../schemas/registrationCenter.schema';
import { RegistrationCenterController } from './registration-center.controller';
import { RegistrationCenterService } from './registration-center.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationCenter.name, schema: RegistrationCenterSchema },
    ]),
  ],
  providers: [RegistrationCenterService],
  controllers: [RegistrationCenterController],
})
export class RegistrationCenterModule {}
