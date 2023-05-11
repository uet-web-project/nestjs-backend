import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationDep,
  RegistrationDepDocument,
} from '../schemas/registration-dep.schema';
import { IRegistrationDep } from '../interfaces/registrationDep.interface';

import { faker } from '@faker-js/faker';
import { ObjectId } from 'bson';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegistrationDepService {
  constructor(
    @InjectModel(RegistrationDep.name)
    private registrationDepModel: Model<RegistrationDepDocument>,
  ) {}

  async findAll(): Promise<RegistrationDep[]> {
    return this.registrationDepModel.find().exec();
  }

  async findByDepId(depId: string): Promise<RegistrationDep> {
    return this.registrationDepModel.findOne({ depId: depId }).exec();
  }

  async findByDepName(depName: string): Promise<RegistrationDep> {
    return this.registrationDepModel.findOne({ name: depName }).exec();
  }

  async create(registrationDep: IRegistrationDep): Promise<RegistrationDep> {
    registrationDep = {
      ...registrationDep,
      password: await bcrypt.hash(registrationDep.password, 10),
    };
    const createdDep = new this.registrationDepModel(registrationDep);
    return createdDep.save();
  }

  async deleteById(id: string): Promise<void> {
    await this.registrationDepModel.findByIdAndDelete(id).catch((error) => {
      throw error;
    });
  }

  async genFakeData(): Promise<void> {
    const fakeData: IRegistrationDep[] = [];
    for (let i = 0; i < 25; i++) {
      fakeData.push({
        _id: new ObjectId().toString(),
        depId: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
        name: faker.company.name(),
        password: await bcrypt.hash(faker.internet.password(8, true), 10),
      });
    }
    await this.registrationDepModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.registrationDepModel.deleteMany({});
  }
}
