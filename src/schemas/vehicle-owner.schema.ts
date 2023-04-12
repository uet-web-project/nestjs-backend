import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VehicleOwnerDocument = HydratedDocument<VehicleOwner>;

@Schema()
export class VehicleOwner {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['personal', 'company'] })
  ownerType: string;

  @Prop({ unique: true })
  cid: string;
}

export const VehicleOwnerSchema = SchemaFactory.createForClass(VehicleOwner);
