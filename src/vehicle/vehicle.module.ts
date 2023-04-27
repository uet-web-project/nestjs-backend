import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationCenterModule } from '../registration-center/registration-center.module';
import { VehicleOwnerModule } from '../vehicle-owner/vehicle-owner.module';
import { Vehicle, VehicleSchema } from '../schemas/vehicle.schema';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    RegistrationCenterModule,
    VehicleOwnerModule,
  ],
  providers: [VehicleService],
  controllers: [VehicleController],
})
export class VehicleModule {}