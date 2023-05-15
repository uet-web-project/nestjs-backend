import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { RegistrationCenterService } from '../registration-center/registration-center.service';
import { VehicleOwnerService } from '../vehicle-owner/vehicle-owner.service';
import { IVehicle } from '../interfaces/vehicle.interface';
import { ObjectId } from 'bson';
import { faker } from '@faker-js/faker';
import { Flags } from 'src/constants/Flags';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    private registrationCenterService: RegistrationCenterService,
    private vehicleOwnerService: VehicleOwnerService,
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

  async groupByVehicleType(filter: string): Promise<any> {
    let matchFilter = {};
    if (filter === Flags.FILTER_BY_MONTH) {
      matchFilter = {
        $and: [
          {
            $expr: {
              $eq: [
                {
                  $year: {
                    $dateFromString: { dateString: '$registrationDate' },
                  },
                },
                new Date().getFullYear(),
              ],
            },
          },
          {
            $expr: {
              $eq: [
                {
                  $month: {
                    $dateFromString: { dateString: '$registrationDate' },
                  },
                },
                new Date().getMonth(),
              ],
            },
          },
        ],
      };
    } else if (filter === Flags.FILTER_BY_YEAR) {
      matchFilter = {
        $expr: {
          $eq: [
            { $year: { $dateFromString: { dateString: '$registrationDate' } } },
            new Date().getFullYear(),
          ],
        },
      };
    }

    return this.vehicleModel
      .aggregate([
        {
          $match: matchFilter,
        },
        {
          $group: {
            _id: '$vehicleType',
            count: { $sum: 1 }, // sum of each group,
            vehicles: { $push: { registrationDate: '$registrationDate' } },
          },
        },
      ])
      .exec();
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

  async genFakeData(): Promise<void> {
    const vehicleTypes = ['car', 'truck', 'bus'];
    const purposes = [
      'personal_transportation',
      'delivery',
      'public_transportation',
    ];
    const fakeData: IVehicle[] = [];
    const registrationCenters: any[] =
      await this.registrationCenterService.findAll();
    const owners: any[] = await this.vehicleOwnerService.findAll();

    const registrationCentersIds: string[] = registrationCenters.map(
      (center) => center._id,
    );
    const ownersIds: string[] = owners.map((owner) => owner._id);

    for (let i = 0; i < 500; i++) {
      const randomCenterIndex = Math.floor(
        Math.random() * registrationCentersIds.length,
      );
      const randomOwnerIndex = Math.floor(Math.random() * ownersIds.length);
      const randomVehicleTypeIndex = Math.floor(Math.random() * 3);
      fakeData.push({
        _id: new ObjectId().toString(),
        vin: faker.vehicle.vin(),
        registrationNumber: faker.vehicle.vrm(),
        registrationDate: faker.date
          .between('2010-01-01', new Date().toISOString())
          .toISOString(),
        registrationLocation: faker.address.city(),
        vehicleType: vehicleTypes[randomVehicleTypeIndex],
        purpose: purposes[randomVehicleTypeIndex],
        manufacturer: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        version: faker.date
          .between('2010-01-01', '2022-01-01')
          .getFullYear()
          .toString(),
        licensePlate: `30E-${faker.random.numeric(5)}`,
        width: faker.datatype.number({ min: 1800, max: 2200 }),
        length: faker.datatype.number({ min: 4500, max: 6000 }),
        wheelBase: faker.datatype.number({ min: 2200, max: 3000 }),
        emission: faker.datatype.number({ min: 4, max: 7 }),
        mileage: faker.datatype.number({ min: 100, max: 100000 }),
        vehicleOwner: ownersIds[randomOwnerIndex],
        registrationCenter: registrationCentersIds[randomCenterIndex],
      });
    }
    // console.log(fakeData);
    await this.vehicleModel.insertMany(fakeData);
  }
}
