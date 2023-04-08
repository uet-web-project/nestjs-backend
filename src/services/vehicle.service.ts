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

  async findExpired(): Promise<Vehicle[]> {
    const currentDate = new Date();
    return this.vehicleModel
      .find({
        $expr: {
          $lt: [new Date('$registrationDate').getTime(), currentDate.getTime()],
        },
      })
      .exec();
  }

  async findByRegistrationCenter(centerId: string): Promise<Vehicle[]> {
    return this.vehicleModel.find({ registrationCenter: centerId }).exec();
  }

  async findByVehicleType(vehicleType: string): Promise<Vehicle[]> {
    return this.vehicleModel.find({ vehicleType: vehicleType }).exec();
  }

  async create(vehicle: IVehicle): Promise<Vehicle> {
    const newVehicle = new this.vehicleModel(vehicle);
    return newVehicle.save();
  }

  async createMany(vehicles: IVehicle[]): Promise<void> {
    const res = await this.vehicleModel.insertMany(vehicles);
    console.log(res);
  }

  async deleteById(id: string): Promise<void> {
    await this.vehicleModel.findByIdAndDelete(id).exec();
  }
}
