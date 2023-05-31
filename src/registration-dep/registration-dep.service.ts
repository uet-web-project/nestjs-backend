import { Model } from 'mongoose';
import { Injectable, NotAcceptableException } from '@nestjs/common';
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

  async getProfile(req: any): Promise<RegistrationDep> {
    const dep: RegistrationDep = await this.registrationDepModel
      .findOne({ _id: req.data._id })
      .exec();
    if (dep) {
      return dep;
    } else {
      throw new NotAcceptableException('Department does not exist');
    }
  }

  async updateProfile(req: any, data: IRegistrationDep) {
    const dep: RegistrationDep = await this.registrationDepModel
      .findOne({ _id: req.data._id })
      .exec();

    if (dep) {
      if (data.password) {
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt);
      }
      return this.registrationDepModel
        .findOneAndUpdate({ _id: req.data._id }, data, {
          returnOriginal: false,
        })
        .exec();
    } else {
      throw new NotAcceptableException('Department does not exist');
    }
  }

  async create(registrationDep: IRegistrationDep): Promise<RegistrationDep> {
    const depIds = (await this.registrationDepModel.find().exec()).map((dep) =>
      dep._id.toString(),
    );

    if (depIds.includes(registrationDep._id)) {
      throw new NotAcceptableException('Department ID already exists');
    }

    const salt = await bcrypt.genSalt();
    registrationDep = {
      ...registrationDep,
      password: await bcrypt.hash(registrationDep.password, salt),
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
    const salt = await bcrypt.genSalt();
    for (let i = 0; i < 25; i++) {
      fakeData.push({
        _id: new ObjectId().toString(),
        depId: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
        name: faker.company.name(),
        password: await bcrypt.hash(faker.internet.password(8, true), salt),
      });
    }
    await this.registrationDepModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.registrationDepModel.deleteMany({});
  }
}
