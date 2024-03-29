import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RegistrationCenter } from './registration-center.schema';
import { VehicleOwner } from './vehicle-owner.schema';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema()
export class Vehicle {
  @Prop({ required: true, unique: true })
  vin: string;

  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @Prop({ required: true })
  registrationDate: string;

  @Prop()
  registrationExpirationDate: string;

  @Prop({ required: true })
  registrationLocation: string;

  @Prop({ required: true, unique: true })
  licensePlate: string;

  @Prop({
    required: true,
    // ref: VehicleOwner.name,
    // type: mongoose.Schema.Types.ObjectId,
  })
  // vehicleOwnerCid: VehicleOwner;
  vehicleOwnerCid: string;

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
  length: number;

  @Prop({ required: true })
  wheelBase: number;

  @Prop({ required: true })
  emission: number;

  @Prop({ required: true })
  mileage: number;

  @Prop({
    required: true,
    // ref: RegistrationCenter.name,
    // type: mongoose.Schema.Types.ObjectId,
  })
  // registrationCenterId: RegistrationCenter;
  registrationCenterId: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
