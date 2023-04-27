import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterDocument,
} from 'src/schemas/registration-center.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';
import { RegistrationDepService } from '../registration-dep/registration-dep.service';

import { faker } from '@faker-js/faker';
import { ObjectId } from 'bson';

@Injectable()
export class RegistrationCenterService {
  constructor(
    @InjectModel(RegistrationCenter.name)
    private registrationCenterModel: Model<RegistrationCenterDocument>,
    private registrationDepService: RegistrationDepService,
  ) {}

  async findAll(): Promise<RegistrationCenter[]> {
    return this.registrationCenterModel.find().exec();
  }

  async findByCenterId(centerId: string): Promise<RegistrationCenter> {
    return this.registrationCenterModel.findOne({ centerId: centerId }).exec();
  }

  async create(
    registrationCenter: IRegistrationCenter,
  ): Promise<RegistrationCenter> {
    const createdCenter = new this.registrationCenterModel(registrationCenter);
    return createdCenter.save();
  }

  async login(registrationCenter: IRegistrationCenter): Promise<any> {
    const res = await this.registrationCenterModel
      .findOne({
        centerId: registrationCenter.centerId,
      })
      .exec();
    if (res) {
      if (res.password === registrationCenter.password) {
        return res;
      }
      return 'Wrong Password';
    }
    return 'Center ID does not exist';
  }

  async deleteById(id: string): Promise<void> {
    await this.registrationCenterModel.findByIdAndDelete(id).catch((error) => {
      throw error;
    });
  }

  async genFakeData(): Promise<void> {
    const fakeData: IRegistrationCenter[] = [];

    // get all dep IDs
    const deps: any[] = await this.registrationDepService.findAll();
    const depsIds: string[] = deps.map((dep) => dep._id.toString());

    for (let i = 0; i < 200; i++) {
      // get a random dep ID for registrationDep field
      const randomIndex = Math.floor(Math.random() * depsIds.length);
      fakeData.push({
        _id: new ObjectId().toString(),
        centerId: faker.datatype
          .number({ min: 100000, max: 999999 })
          .toString(),
        password: faker.internet.password(8, true),
        name: faker.company.catchPhrase(),
        location: faker.address.city(),
        phoneNumber: faker.phone.number('09########'),
        registrationDep: depsIds[randomIndex],
      });
    }
    await this.registrationCenterModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.registrationCenterModel.deleteMany({});
  }
}