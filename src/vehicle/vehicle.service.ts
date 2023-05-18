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
import getCurrentWeekOfYear from 'src/utils/getCurrentWeekOfTheYear';

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

  async getRegisteredVehiclesCount(filter: string): Promise<any> {
    const findFilter = getFindFilterByDate(filter);
    const vehiclesRegisteredWithinFilter: Vehicle[] = await this.vehicleModel
      .find(findFilter)
      .exec();
    let res: any;
    if (filter === Flags.FILTER_BY_WEEK) {
      res = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      };
      Object.keys(res).map((key, index) => {
        res[key] = vehiclesRegisteredWithinFilter.filter((vehicle) => {
          const date = new Date(vehicle.registrationDate);
          return date.getDay() === index;
        }).length;
      });
    } else if (filter === Flags.FILTER_BY_MONTH) {
      res = {
        week1: [],
        week2: [],
        week3: [],
        week4: [],
        remainingDays: [],
      };
      res.week1 = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() <= 7;
      });
      res.week2 = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 7 && date.getDate() <= 14;
      });
      res.week3 = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 14 && date.getDate() <= 21;
      });
      res.week4 = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 21 && date.getDate() <= 38;
      });
      res.remainingDays = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 28;
      });
    } else if (filter === Flags.FILTER_BY_YEAR) {
      res = {
        january: [],
        february: [],
        march: [],
        april: [],
        may: [],
        june: [],
        july: [],
        august: [],
        september: [],
        october: [],
        november: [],
        december: [],
      };
      Object.keys(res).map((key, index) => {
        res[key] = vehiclesRegisteredWithinFilter.filter((vehicle) => {
          const date = new Date(vehicle.registrationDate);
          return date.getMonth() === index;
        }).length;
      });
    }
    return res;
  }

  /**Group vehicle by their type and filters by current week, month or year */
  async groupByVehicleType(filter: string): Promise<any> {
    const matchFilter = getAggregationMatchFilterByDate(filter);

    return this.vehicleModel
      .aggregate([
        {
          $match: matchFilter,
        },
        {
          $group: {
            _id: '$vehicleType',
            vehicles: { $sum: 1 }, // sum of each group,
            vehicleInfos: { $push: { registrationDate: '$registrationDate' } },
          },
        },
        {
          $project: {
            _id: 0,
            vehicleType: '$_id',
            vehicles: 1,
            vehicleInfos: 1,
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

  /**Genarates a bunch of fake data using faker.js */
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

/**Get the find filter by date */
function getFindFilterByDate(filter: string) {
  let findFilter = {};
  if (filter === Flags.FILTER_BY_WEEK) {
    findFilter = {
      $and: [
        {
          $expr: {
            $eq: [
              {
                $week: {
                  $dateFromString: { dateString: '$registrationDate' },
                },
              },
              getCurrentWeekOfYear() + 1,
            ],
          },
        },
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
      ],
    };
  } else if (filter === Flags.FILTER_BY_MONTH) {
    findFilter = {
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
              new Date().getMonth() + 1,
            ],
          },
        },
      ],
    };
  } else if (filter === Flags.FILTER_BY_YEAR) {
    findFilter = {
      $expr: {
        $eq: [
          { $year: { $dateFromString: { dateString: '$registrationDate' } } },
          new Date().getFullYear(),
        ],
      },
    };
  }
  return findFilter;
}

/**Get aggregation match filter based on the input filter by date */
function getAggregationMatchFilterByDate(filter: string) {
  let matchFilter = {};
  if (filter === Flags.FILTER_BY_WEEK) {
    matchFilter = {
      $and: [
        {
          $expr: {
            $eq: [
              {
                $week: {
                  $dateFromString: { dateString: '$registrationDate' },
                },
              },
              getCurrentWeekOfYear() + 1,
            ],
          },
        },
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
      ],
    };
  }
  // filter by month by filtering the year and month of registrationDate to be the same as the current year and month
  else if (filter === Flags.FILTER_BY_MONTH) {
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
              new Date().getMonth() + 1,
            ],
          },
        },
      ],
    };
    // filter by year by filtering the year of registrationDate to be the same as the current year
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
  return matchFilter;
}
