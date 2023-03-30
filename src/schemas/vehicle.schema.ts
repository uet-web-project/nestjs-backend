import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema()
export class Vehicle {
  @Prop({ required: true })
  licensePlate: string;

  @Prop({ required: true, ref: 'vehicleOwner' })
  vehicleOwner: ObjectId;

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
  gearBox: string;

  @Prop({ required: true, ref: 'registrationCenter' })
  registrationCenter: ObjectId;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
