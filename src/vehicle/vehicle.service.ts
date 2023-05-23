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

  async getRegisteredVehiclesCount(filter: string, req: any): Promise<any> {
    // check whether the user is a registration center or a department
    const isCenter = req.data.centerId ? true : false;
    const findFilter = isCenter
      ? getFindFilterByDate(filter, null, null, req.data._id)
      : getFindFilterByDate(filter);
    const vehiclesRegisteredWithinFilter: Vehicle[] = await this.vehicleModel
      .find(findFilter)
      .exec();

    let res: any;
    if (filter === Flags.FILTER_BY_WEEK) {
      res = [
        { date: 'Sun', vehicles: 0 },
        { date: 'Mon', vehicles: 0 },
        { date: 'Tue', vehicles: 0 },
        { date: 'Wed', vehicles: 0 },
        { date: 'Thu', vehicles: 0 },
        { date: 'Fri', vehicles: 0 },
        { date: 'Sat', vehicles: 0 },
      ];
      res.map((item, index) => {
        res[index].vehicles = vehiclesRegisteredWithinFilter.filter(
          (vehicle) => {
            const date = new Date(vehicle.registrationDate);
            return date.getDay() === index;
          },
        ).length;
      });
    } else if (filter === Flags.FILTER_BY_MONTH) {
      res = [
        { date: 'Week 1', vehicles: 0 },
        { date: 'Week 2', vehicles: 0 },
        { date: 'Week 3', vehicles: 0 },
        { date: 'Week 4', vehicles: 0 },
        { date: 'Other', vehicles: 0 },
      ];
      res[0].vehicles = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() <= 7;
      }).length;
      res[1].vehicles = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 7 && date.getDate() <= 14;
      }).length;
      res[2].vehicles = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 14 && date.getDate() <= 21;
      }).length;
      res[3].vehicles = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 21 && date.getDate() <= 28;
      }).length;
      res[4].vehicles = vehiclesRegisteredWithinFilter.filter((vehicle) => {
        const date = new Date(vehicle.registrationDate);
        return date.getDate() > 28;
      }).length;
    } else if (filter === Flags.FILTER_BY_YEAR) {
      res = [
        { date: 'Jan', vehicles: 0 },
        { date: 'Feb', vehicles: 0 },
        { date: 'Mar', vehicles: 0 },
        { date: 'Apr', vehicles: 0 },
        { date: 'May', vehicles: 0 },
        { date: 'Jun', vehicles: 0 },
        { date: 'Jul', vehicles: 0 },
        { date: 'Aug', vehicles: 0 },
        { date: 'Sep', vehicles: 0 },
        { date: 'Oct', vehicles: 0 },
        { date: 'Nov', vehicles: 0 },
        { date: 'Dec', vehicles: 0 },
      ];
      res.map((item, index) => {
        res[index].vehicles = vehiclesRegisteredWithinFilter.filter(
          (vehicle) => {
            const date = new Date(vehicle.registrationDate);
            return date.getMonth() === index;
          },
        ).length;
      });
    }
    return res;
  }

  /**Group vehicle by their type and filters by current week, month or year */
  async groupByVehicleType(filter: string, req: any): Promise<any> {
    const isCenter = req.data.centerId ? true : false;

    const matchFilter = isCenter
      ? getFindFilterByDate(filter, null, null, req.data._id)
      : getFindFilterByDate(filter);

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

  async getVehiclesByTypeAndDateRange(
    body: {
      vehicleType: string;
      startDate: string;
      endDate: string;
    },
    req: any,
  ): Promise<any> {
    const matchFilter = getFindFilterByDate(
      Flags.FILTER_BY_DATE_RANGE,
      body.startDate,
      body.endDate,
      req.data.centerId ? req.data._id : null,
    );

    let filterType: string;
    let groupId: any;
    const startDateObj = new Date(body.startDate);
    const endDateObj = new Date(body.endDate);
    if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
      if (Math.abs(startDateObj.getMonth() - endDateObj.getMonth()) <= 1) {
        filterType = Flags.FILTER_BY_DAY;
        groupId = {
          $dateFromString: {
            dateString: '$registrationDate',
          },
        };
      } else {
        filterType = Flags.FILTER_BY_WEEK;
        groupId = {
          $dateFromParts: {
            isoWeekYear: {
              $year: {
                $dateFromString: {
                  dateString: '$registrationDate',
                },
              },
            },
            isoWeek: {
              $week: {
                $dateFromString: {
                  dateString: '$registrationDate',
                },
              },
            },
          },
        };
      }
    } else {
      filterType = Flags.FILTER_BY_MONTH;
      groupId = {
        $dateFromParts: {
          year: {
            $year: {
              $dateFromString: {
                dateString: '$registrationDate',
              },
            },
          },
          month: {
            $month: {
              $dateFromString: {
                dateString: '$registrationDate',
              },
            },
          },
        },
      };
    }

    const groupAggregation = {
      _id: groupId,
      vehicles: { $sum: 1 },
    };

    return this.vehicleModel
      .aggregate([
        { $match: matchFilter },
        { $group: groupAggregation },
        { $sort: { _id: 1 } },
        {
          $project: {
            date:
              filterType === Flags.FILTER_BY_WEEK // will return a date range from the start of the week to the end of the week
                ? {
                    // ex: 17/04/2023 - 23/04/2023
                    $concat: [
                      {
                        $dateToString: {
                          format: '%d/%m/%Y',
                          date: '$_id',
                        },
                      },
                      ' - ',
                      {
                        $dateToString: {
                          format: '%d/%m/%Y',
                          date: {
                            $dateFromParts: {
                              isoWeekYear: {
                                $year: '$_id',
                              },
                              isoWeek: {
                                $week: '$_id',
                              },
                              isoDayOfWeek: 7,
                            },
                          },
                        },
                      },
                    ],
                  }
                : {
                    $dateToString: {
                      format:
                        filterType === Flags.FILTER_BY_DAY
                          ? '%d/%m/%Y'
                          : '%m/%Y',
                      date: '$_id',
                    },
                  },
            vehicles: 1,
            _id: 0,
          },
        },
      ])
      .exec();
  }

  async getNearExpiredVehicles(req: any): Promise<Vehicle[]> {
    const isCenter = req.data.centerId ? true : false;
    const currentDate = new Date();
    const nextMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1),
    );
    return this.vehicleModel
      .find({
        $and: [
          {
            $expr: {
              $gte: [
                {
                  $dateFromString: {
                    dateString: '$registrationExpirationDate',
                  },
                },
                new Date(),
              ],
            },
          },
          {
            $expr: {
              $lte: [
                {
                  $dateFromString: {
                    dateString: '$registrationExpirationDate',
                  },
                },
                new Date(nextMonth),
              ],
            },
          },
          isCenter ? { registrationCenter: req.data._id } : {},
        ],
      })
      .exec();
  }

  async create(vehicle: IVehicle): Promise<Vehicle> {
    vehicle.registrationExpirationDate = getVehicleRegExpirationDate(vehicle);
    console.log(vehicle);

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

    for (let i = 0; i < 100; i++) {
      const randomCenterIndex = Math.floor(
        Math.random() * registrationCentersIds.length,
      );
      const randomOwnerIndex = Math.floor(Math.random() * ownersIds.length);
      const randomVehicleTypeIndex = Math.floor(Math.random() * 3);
      const randomLicensePlate = `${faker.datatype.number({
        min: 25,
        max: 35,
      })}E-${faker.random.numeric(5)}`;
      const randomVehicleVersion = faker.date
        .between('2020-01-01', '2023-01-01')
        .getFullYear()
        .toString();
      const fakeVehicle: IVehicle = {
        _id: new ObjectId().toString(),
        vin: faker.vehicle.vin(),
        registrationNumber: randomLicensePlate,
        registrationDate: faker.date
          .between(`${randomVehicleVersion}-01-01`, new Date().toISOString())
          .toISOString(),
        // registrationDate: faker.date
        //   .between(
        //     `${2021}-${new Date().getMonth() + 1}-01`,
        //     new Date().toISOString(),
        //   )
        //   .toISOString(),
        registrationLocation: faker.address.city(),
        vehicleType: vehicleTypes[randomVehicleTypeIndex],
        // vehicleType: 'car',
        purpose: purposes[randomVehicleTypeIndex],
        manufacturer: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        version: randomVehicleVersion,
        // version: '2021',
        licensePlate: randomLicensePlate,
        width: faker.datatype.number({ min: 1800, max: 2200 }),
        length: faker.datatype.number({ min: 4500, max: 6000 }),
        wheelBase: faker.datatype.number({ min: 2200, max: 3000 }),
        emission: faker.datatype.number({ min: 4, max: 7 }),
        mileage: faker.datatype.number({ min: 100, max: 100000 }),
        vehicleOwner: ownersIds[randomOwnerIndex],
        registrationCenter: registrationCentersIds[randomCenterIndex],
        // registrationCenter: '645cde729853fa379a8873ea',
      };
      fakeVehicle.registrationExpirationDate =
        getVehicleRegExpirationDate(fakeVehicle);
      fakeData.push(fakeVehicle);
    }
    // console.log(fakeData);
    await this.vehicleModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.vehicleModel.deleteMany({}).exec();
  }
}

/**Get the find filter by date */
function getFindFilterByDate(
  filter: string,
  startDate?: string,
  endDate?: string,
  centerId?: string,
) {
  let findFilter = {};
  if (filter === Flags.FILTER_BY_DATE_RANGE) {
    findFilter = {
      $and: [
        {
          $expr: {
            $gte: [
              {
                $dateFromString: { dateString: '$registrationDate' },
              },
              new Date(startDate),
            ],
          },
        },
        {
          $expr: {
            $lte: [
              {
                $dateFromString: { dateString: '$registrationDate' },
              },
              new Date(endDate),
            ],
          },
        },
        centerId ? { registrationCenter: new ObjectId(centerId) } : {},
      ],
    };
  } else if (filter === Flags.FILTER_BY_WEEK) {
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
              getCurrentWeekOfYear(),
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
        centerId ? { registrationCenter: new ObjectId(centerId) } : {},
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
              new Date().getMonth() + 1, // + 1 because $month and Date.getMonth() return different values,
            ],
          },
        },
        centerId ? { registrationCenter: new ObjectId(centerId) } : {},
      ],
    };
  } else if (filter === Flags.FILTER_BY_YEAR) {
    findFilter = {
      $and: [
        {
          $expr: {
            $eq: [
              {
                $year: { $dateFromString: { dateString: '$registrationDate' } },
              },
              new Date().getFullYear(),
            ],
          },
        },
        centerId ? { registrationCenter: new ObjectId(centerId) } : {},
      ],
    };
  }
  return findFilter;
}

function getVehicleRegExpirationDate(vehicle: IVehicle): string {
  let expirationDate: string;
  const currentDate = new Date();
  const vehicleRegDate = new Date(vehicle.registrationDate);
  const vehicleRegMonth = vehicleRegDate.getMonth();
  switch (vehicle.vehicleType) {
    case 'car':
      if (vehicle.purpose === 'personal_transportation') {
        if (parseInt(vehicle.version) >= currentDate.getFullYear() - 7) {
          expirationDate = new Date(
            vehicleRegDate.setMonth(vehicleRegMonth + 24),
          ).toISOString();
        } else if (
          parseInt(vehicle.version) >=
          currentDate.getFullYear() - 20
        ) {
          expirationDate = new Date(
            vehicleRegDate.setMonth(vehicleRegMonth + 12),
          ).toISOString();
        } else {
          expirationDate = new Date(
            vehicleRegDate.setMonth(vehicleRegMonth + 6),
          ).toISOString();
        }
      }
      break;

    case 'truck':
      if (parseInt(vehicle.version) >= currentDate.getFullYear() - 7) {
        expirationDate = new Date(
          vehicleRegDate.setMonth(vehicleRegMonth + 12),
        ).toISOString();
      } else {
        expirationDate = new Date(
          vehicleRegDate.setMonth(vehicleRegMonth + 6),
        ).toISOString();
      }
      break;

    case 'bus':
      if (parseInt(vehicle.version) >= currentDate.getFullYear() - 5) {
        expirationDate = new Date(
          vehicleRegDate.setMonth(vehicleRegMonth + 12),
        ).toISOString();
      } else {
        expirationDate = new Date(
          vehicleRegDate.setMonth(vehicleRegMonth + 6),
        ).toISOString();
      }
      break;

    default:
      break;
  }

  return expirationDate;
}
