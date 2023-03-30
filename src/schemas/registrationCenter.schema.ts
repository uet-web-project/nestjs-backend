import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type RegistrationCenterDocument = HydratedDocument<RegistrationCenter>;

@Schema()
export class RegistrationCenter {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, ref: 'registrationDep' })
  registrationDep: ObjectId;
}

export const RegistrationCenterSchema =
  SchemaFactory.createForClass(RegistrationCenter);
