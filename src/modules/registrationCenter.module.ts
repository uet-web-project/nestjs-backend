import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterSchema,
} from '../schemas/registrationCenter.schema';
import { RegistrationCenterService } from '../services/registrationCenter.service';
import { RegistrationCenterController } from '../controllers/registrationCenter.controller';

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
