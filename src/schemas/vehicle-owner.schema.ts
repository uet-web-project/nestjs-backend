import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VehicleOwnerDocument = HydratedDocument<VehicleOwner>;

@Schema()
export class VehicleOwner {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['personal', 'company'] })
  ownerType: string;

  @Prop({ unique: true })
  cid: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phoneNumber: string;
}

export const VehicleOwnerSchema = SchemaFactory.createForClass(VehicleOwner);
