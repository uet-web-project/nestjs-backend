import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationDep,
  RegistrationDepDocument,
} from '../schemas/registrationDep.schema';
import { IRegistrationDep } from '../interfaces/registrationDep.interface';

@Injectable()
export class RegistrationDepService {
  constructor(
    @InjectModel(RegistrationDep.name)
    private registrationDepModel: Model<RegistrationDepDocument>,
  ) {}

  async create(registrationDep: IRegistrationDep): Promise<RegistrationDep> {
    const createdDep = new this.registrationDepModel(registrationDep);
    return createdDep.save();
  }

  async findAll(): Promise<RegistrationDep[]> {
    return this.registrationDepModel.find().exec();
  }
}
