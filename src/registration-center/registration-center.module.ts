import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterSchema,
} from '../schemas/registration-center.schema';
import { RegistrationCenterController } from './registration-center.controller';
import { RegistrationCenterService } from './registration-center.service';
import { RegistrationDepModule } from '../registration-dep/registration-dep.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationCenter.name, schema: RegistrationCenterSchema },
    ]),
    RegistrationDepModule,
  ],
  providers: [RegistrationCenterService],
  controllers: [RegistrationCenterController],
  exports: [RegistrationCenterService],
})
export class RegistrationCenterModule {}
