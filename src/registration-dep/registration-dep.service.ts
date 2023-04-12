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

  async findAll(): Promise<RegistrationDep[]> {
    return this.registrationDepModel.find().exec();
  }

  async create(registrationDep: IRegistrationDep): Promise<RegistrationDep> {
    const createdDep = new this.registrationDepModel(registrationDep);
    return createdDep.save();
  }

  async login(registrationDep: IRegistrationDep): Promise<any> {
    const res = await this.registrationDepModel.findOne({
      name: registrationDep.name,
    });

    if (res) {
      if (res.password === registrationDep.password) {
        return res;
      }
      return 'Wrong Password';
    }
    return 'Department does not exist';
  }

  async deleteById(id: string): Promise<void> {
    await this.registrationDepModel.findByIdAndDelete(id).catch((error) => {
      throw error;
    });
  }
}
