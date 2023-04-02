import { Model } from 'mongoose';
import { HttpCode, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterDocument,
} from 'src/schemas/registrationCenter.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';
import { response } from 'express';

@Injectable()
export class RegistrationCenterService {
  constructor(
    @InjectModel(RegistrationCenter.name)
    private registrationCenterModel: Model<RegistrationCenterDocument>,
  ) {}

  async findAll(): Promise<RegistrationCenter[]> {
    return this.registrationCenterModel.find().exec();
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
    } else {
      return 'Center ID does not exist';
    }
  }
}
