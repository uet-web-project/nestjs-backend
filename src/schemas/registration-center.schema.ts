import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RegistrationDep } from './registration-dep.schema';

export type RegistrationCenterDocument = HydratedDocument<RegistrationCenter>;

@Schema()
export class RegistrationCenter {
  @Prop({ required: true, unique: true })
  centerId: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  provinceCode: number;

  @Prop({ required: true })
  districtCode: number;

  @Prop({ required: true })
  location: string;

  @Prop()
  fullAdress: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({
    required: true,
    ref: RegistrationDep.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  registrationDep: RegistrationDep;
}

export const RegistrationCenterSchema =
  SchemaFactory.createForClass(RegistrationCenter);
