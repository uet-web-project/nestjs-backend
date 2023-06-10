import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationCenterModule } from '../registration-center/registration-center.module';
import { VehicleOwnerModule } from '../vehicle-owner/vehicle-owner.module';
import { RegistrationDepModule } from 'src/registration-dep/registration-dep.module';
import { Vehicle, VehicleSchema } from '../schemas/vehicle.schema';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { ProvinceModule } from 'src/province/province.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    RegistrationCenterModule,
    RegistrationDepModule,
    VehicleOwnerModule,
    ProvinceModule,
  ],
  providers: [VehicleService],
  controllers: [VehicleController],
})
export class VehicleModule {}
