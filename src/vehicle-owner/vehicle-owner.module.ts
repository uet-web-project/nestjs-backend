import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleOwnerService } from './vehicle-owner.service';
import { VehicleOwnerController } from './vehicle-owner.controller';
import {
  VehicleOwner,
  VehicleOwnerSchema,
} from '../schemas/vehicle-owner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleOwner.name, schema: VehicleOwnerSchema },
    ]),
  ],
  providers: [VehicleOwnerService],
  controllers: [VehicleOwnerController],
})
export class VehicleOwnerModule {}
