import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegistrationDepDocument = HydratedDocument<RegistrationDep>;

@Schema()
export class RegistrationDep {
  @Prop({ required: true })
  name: string;
}

export const RegistrationDepSchema =
  SchemaFactory.createForClass(RegistrationDep);
