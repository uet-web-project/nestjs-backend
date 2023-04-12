import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RegistrationDepDocument = HydratedDocument<RegistrationDep>;

@Schema()
export class RegistrationDep {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;
}

export const RegistrationDepSchema =
  SchemaFactory.createForClass(RegistrationDep);
