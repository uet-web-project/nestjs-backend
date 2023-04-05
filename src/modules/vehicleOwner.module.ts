import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleOwnerService } from '../services/vehicleOwner.service';
import { VehicleOwnerController } from '../controllers/vehicleOwner.controller';
import {
  VehicleOwner,
  VehicleOwnerSchema,
} from '../schemas/vehicleOwner.schema';

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
