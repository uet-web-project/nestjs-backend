import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RegistrationDep } from './registrationDep.schema';

export type RegistrationCenterDocument = HydratedDocument<RegistrationCenter>;

@Schema()
export class RegistrationCenter {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    ref: RegistrationDep.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  registrationDep: RegistrationDep;
}

export const RegistrationCenterSchema =
  SchemaFactory.createForClass(RegistrationCenter);
