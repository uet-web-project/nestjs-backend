import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RegistrationCenter } from './registration-center.schema';
import { VehicleOwner } from './vehicle-owner.schema';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema()
export class Vehicle {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @Prop({ required: true })
  registrationDate: string;

  @Prop({ required: true })
  registrationLocation: string;

  @Prop({ required: true, unique: true })
  licensePlate: string;

  @Prop({
    required: true,
    ref: VehicleOwner.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  vehicleOwner: VehicleOwner;

  @Prop({ required: true, enum: ['car', 'truck', 'bus'] })
  vehicleType: string;

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
