import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type VehicleOwnerDocument = HydratedDocument<VehicleOwner>;

@Schema()
export class VehicleOwner {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['personal', 'company'] })
  ownerType: string;

  @Prop({ unique: true })
  cid: string;
}

export const VehicleOwnerSchema = SchemaFactory.createForClass(VehicleOwner);
