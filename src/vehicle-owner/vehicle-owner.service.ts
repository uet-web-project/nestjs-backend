import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VehicleOwner,
  VehicleOwnerDocument,
} from '../schemas/vehicle-owner.schema';
import { Model } from 'mongoose';
import { IVehicleOwner } from '../interfaces/vehicleOwner.interface';
import { ObjectId } from 'bson';
import { faker } from '@faker-js/faker';

@Injectable()
export class VehicleOwnerService {
  constructor(
    @InjectModel(VehicleOwner.name)
    private vehicleOwnerModel: Model<VehicleOwnerDocument>,
  ) {}

  async findAll(): Promise<VehicleOwner[]> {
    return this.vehicleOwnerModel.find().exec();
  }

  async findOwnerByCid(cid: string): Promise<VehicleOwner> {
    return this.vehicleOwnerModel.findOne({ cid: cid }).exec();
  }

  async getAllOwnerCids(): Promise<string[]> {
    return this.vehicleOwnerModel.find().distinct('cid').exec();
  }

  async getOwnerIdByCid(cid: string): Promise<string> {
    const owner = await this.vehicleOwnerModel.findOne({ cid: cid }).exec();
    if (owner) {
      return owner._id.toString();
    } else {
      return null;
    }
  }

  async create(owner: IVehicleOwner): Promise<VehicleOwner> {
    const newOwner = new this.vehicleOwnerModel(owner);
    return newOwner.save();
  }

  async createMany(owners: IVehicleOwner[]): Promise<VehicleOwner[]> {
    return this.vehicleOwnerModel.insertMany(owners);
  }

  async deleteById(id: string): Promise<void> {
    await this.vehicleOwnerModel.findByIdAndDelete(id).catch((error) => {
      throw error;
    });
  }

  async genFakeData(): Promise<void> {
    const fakeData: IVehicleOwner[] = [];
    for (let i = 0; i < 500; i++) {
      const isPersonal = faker.datatype.boolean();
      fakeData.push({
        _id: new ObjectId().toString(),
        name: isPersonal ? faker.name.fullName() : faker.company.name(),
        ownerType: isPersonal ? 'personal' : 'company',
        cid: faker.random.numeric(12).toString(),
        dob: faker.date.past(50).toISOString(),
        address: faker.address.streetAddress(),
        phoneNumber: faker.phone.number('09########'),
      });
    }
    // console.log(fakeData);
    await this.vehicleOwnerModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.vehicleOwnerModel.deleteMany({}).exec();
  }
}
