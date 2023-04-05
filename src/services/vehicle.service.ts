import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { IVehicle } from '../interfaces/vehicle.interface';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  async create(vehicle: IVehicle): Promise<Vehicle> {
    const newVehicle = new this.vehicleModel(vehicle);
    return newVehicle.save();
  }

  async createMany(vehicles: IVehicle[]): Promise<void> {
    const res = await this.vehicleModel.insertMany(vehicles);
    console.log(res);
  }
}
