import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterDocument,
} from 'src/schemas/registrationCenter.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';

@Injectable()
export class RegistrationCenterService {
  constructor(
    @InjectModel(RegistrationCenter.name)
    private registrationCenterModel: Model<RegistrationCenterDocument>,
  ) {}

  async create(
    registrationCenter: IRegistrationCenter,
  ): Promise<RegistrationCenter> {
    const createdCenter = new this.registrationCenterModel(registrationCenter);
    return createdCenter.save();
  }

  async findAll(): Promise<RegistrationCenter[]> {
    return this.registrationCenterModel.find().exec();
  }
}
