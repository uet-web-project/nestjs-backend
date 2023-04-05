import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { RegistrationCenter } from './registrationCenter.schema';
import { VehicleOwner } from './vehicleOwner.schema';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema()
export class Vehicle {
  @Prop({ required: true })
  licensePlate: string;

  @Prop({
    required: true,
    ref: VehicleOwner.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  vehicleOwner: VehicleOwner;

  @Prop({ required: true })
  manufacturer: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  version: string;

  @Prop({
    required: true,
    enum: ['personal_transportation', 'public_transportation', 'delivery'],
    default: 'personal_transportation',
  })
  purpose: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  groundClearance: number;

  @Prop({ required: true })
  cylinderCapacity: number;

  @Prop({ required: true })
  torque: number;

  @Prop({ required: true })
  gearbox: string;

  @Prop({
    required: true,
    ref: RegistrationCenter.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  registrationCenter: RegistrationCenter;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
