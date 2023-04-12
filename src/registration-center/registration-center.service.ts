import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterDocument,
} from 'src/schemas/registration-center.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';

@Injectable()
export class RegistrationCenterService {
  constructor(
    @InjectModel(RegistrationCenter.name)
    private registrationCenterModel: Model<RegistrationCenterDocument>,
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
}
