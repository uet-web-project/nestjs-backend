import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VehicleOwner,
  VehicleOwnerDocument,
} from '../schemas/vehicleOwner.schema';
import { Model } from 'mongoose';
import { IVehicleOwner } from '../interfaces/vehicleOwner.interface';

@Injectable()
export class VehicleOwnerService {
  constructor(
    @InjectModel(VehicleOwner.name)
    private vehicleOwnerModel: Model<VehicleOwnerDocument>,
  ) {}

  async findAll(): Promise<VehicleOwner[]> {
    return this.vehicleOwnerModel.find().exec();
  }

  async create(owner: IVehicleOwner): Promise<VehicleOwner> {
    const newOwner = new this.vehicleOwnerModel(owner);
    return newOwner.save();
  }
}
