import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
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
import xlsxToJson from 'src/utils/xlsxToJson';
import { IVehicleOwner } from 'src/interfaces/vehicleOwner.interface';
import { getJsDateFromExcel } from 'excel-date-to-js';
import excelJsonChecker from 'src/utils/excelJsonChecker';
import isIsoString from 'src/utils/isIsoString';
import { RegistrationCenter } from 'src/schemas/registration-center.schema';
import { ProvinceService } from 'src/province/province.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    private registrationCenterService: RegistrationCenterService,
    private vehicleOwnerService: VehicleOwnerService,
    private provinceService: ProvinceService,
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

  async findByRegistrationDep(req: any): Promise<Vehicle[]> {
    if (!req.data.depId) {
      throw new UnauthorizedException('Unoauthorized token');
    }
    const depId = req.data._id;
    const centers = await this.registrationCenterService.findByDepId(depId);
    const centerIds = centers.map((center) => center.centerId);
    return this.vehicleModel.find({ registrationCenterId: centerIds }).exec();
  }

  async findByRegistrationCenter(req: any): Promise<Vehicle[]> {
    if (!req.data.centerId) {
      throw new UnauthorizedException('Unoauthorized token');
    }
    const centerId = req.data.centerId;
    return this.vehicleModel.find({ registrationCenterId: centerId }).exec();
  }

  async findByVehicleType(vehicleType: string): Promise<Vehicle[]> {
    return this.vehicleModel.find({ vehicleType: vehicleType }).exec();
  }

  async getRegisteredVehiclesCount(filter: string, req: any): Promise<any> {
    let centerId: string | string[] = null;
    if (req.data.depId) {
      const centers = await this.registrationCenterService.findByDepId(
        req.data._id,
      );
      centerId = centers.map((center) => center.centerId);
    } else if (req.data.centerId) {
      centerId = req.data.centerId;
    }

    // check whether the user is a registration center or a department
    const matchFilter = getFindFilterByDate(filter, centerId, null, null);
    const vehiclesRegisteredWithinFilter: Vehicle[] = await this.vehicleModel
      .aggregate([
        {
          $lookup: {
            from: 'registrationcenters',
            localField: 'registrationCenterId',
            foreignField: 'centerId',
            as: 'registrationInformation',
          },
        },
        { $match: matchFilter },
      ])
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
  async groupByVehicleType(
    body: {
      filterType: string;
      startDate?: string;
      endDate?: string;
      getNearExpired?: boolean;
      provinceCode?: number;
      districtCode?: number;
    },
    req: any,
  ): Promise<any> {
    let centerId: string | string[] = null;
    if (req.data.depId) {
      const centers = await this.registrationCenterService.findByDepId(
        req.data._id,
      );
      centerId = centers.map((center) => center.centerId);
    } else if (req.data.centerId) {
      centerId = req.data.centerId;
    }

    const matchFilter = getFindFilterByDate(
      body.filterType,
      centerId,
      body.startDate ? body.startDate : null,
      body.endDate ? body.endDate : null,
      null,
      body.getNearExpired,
      body.provinceCode,
      body.districtCode,
    );

    // console.log('group by vehicle type', matchFilter);

    // console.log(await this.vehicleModel.find(matchFilter).exec());

    return this.vehicleModel
      .aggregate([
        {
          $lookup: {
            from: 'registrationcenters',
            localField: 'registrationCenterId',
            foreignField: 'centerId',
            as: 'registrationInformation',
          },
        },
        {
          $match: matchFilter,
        },
        {
          $group: {
            _id: '$vehicleType',
            vehicles: { $sum: 1 }, // sum of each group,
            vehicleInfos: {
              $push: {
                registrationDate: '$registrationDate',
                registrationExpirationDate: '$registrationExpirationDate',
              },
            },
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
      vehicleType?: string;
      startDate: string;
      endDate: string;
      getNearExpired?: boolean;
      provinceCode?: number;
      districtCode?: number;
    },
    req: any,
  ): Promise<any> {
    let centerId: string | string[] = null;
    if (req.data.depId) {
      const centers = await this.registrationCenterService.findByDepId(
        req.data._id,
      );
      centerId = centers.map((center) => center.centerId);
    } else if (req.data.centerId) {
      centerId = req.data.centerId;
    }

    const matchFilter = getFindFilterByDate(
      Flags.FILTER_BY_DATE_RANGE,
      centerId,
      body.startDate,
      body.endDate,
      body.vehicleType,
      body.getNearExpired,
      body.provinceCode,
      body.districtCode,
    );

    // console.log(matchFilter);

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
        {
          $lookup: {
            from: 'registrationcenters',
            localField: 'registrationCenterId',
            foreignField: 'centerId',
            as: 'registrationInformation',
          },
        },
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
    let centerId: string | string[] = null;
    if (req.data.depId) {
      const centers = await this.registrationCenterService.findByDepId(
        req.data._id,
      );
      centerId = centers.map((center) => center.centerId);
    } else if (req.data.centerId) {
      centerId = req.data.centerId;
    }

    const matchFilter = getFindFilterByDate(
      null,
      centerId,
      null,
      null,
      null,
      true,
    );

    return await this.vehicleModel
      .aggregate([
        {
          $lookup: {
            from: 'registrationcenters',
            localField: 'registrationCenterId',
            foreignField: 'centerId',
            as: 'registrationInformation',
          },
        },
        { $match: matchFilter },
      ])
      .exec();
  }

  async create(vehicle: IVehicle): Promise<Vehicle> {
    vehicle.registrationExpirationDate = getVehicleRegExpirationDate(vehicle);

    const newVehicle = new this.vehicleModel(vehicle);
    return newVehicle.save();
  }

  async createMany(vehicles: IVehicle[]): Promise<Vehicle[]> {
    return await this.vehicleModel.insertMany(vehicles);
  }

  async createVehicleFromCertificate(data) {
    try {
      const remodelCertData = await this.remodelJsonData([data]);
      return await this.create(remodelCertData[0]);
    } catch (err) {
      throw err;
    }
  }

  async uploadVehicles(file: Express.Multer.File): Promise<Vehicle[]> {
    try {
      const vehicleJson = xlsxToJson(file.path);
      const remodeledVehicleJson = await this.remodelJsonData(vehicleJson);
      // console.log('Remodeled JSON: \n', remodeledVehicleJson);
      return await this.createMany(remodeledVehicleJson);
    } catch (err) {
      throw err;
    }
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
    const registrationCenters: RegistrationCenter[] =
      await this.registrationCenterService.findAll();
    const owners: any[] = await this.vehicleOwnerService.findAll();
    const provinces = await this.provinceService.getProvinces();

    const registrationCentersIds: string[] = registrationCenters.map(
      (center) => center.centerId,
    );
    const ownersIds: string[] = owners.map((owner) => owner.cid);

    for (let i = 0; i < 100; i++) {
      const randomCenterIndex = Math.floor(
        Math.random() * registrationCentersIds.length,
      );
      const vehicleRegProvince = provinces.find(
        (province) =>
          province.code === registrationCenters[randomCenterIndex].provinceCode,
      );
      const vehicleRegDistrict = vehicleRegProvince.districts.find(
        (district) =>
          district.code === registrationCenters[randomCenterIndex].districtCode,
      );

      const vehicleRegLocation = `${vehicleRegProvince.name}, ${vehicleRegDistrict.name}, ${registrationCenters[randomCenterIndex].location}`;
      // const vehicleRegLocation = `${provinces[0].name}, ${provinces[0].districts[2].name}, Dong Da`;

      const randomOwnerIndex = Math.floor(Math.random() * ownersIds.length);
      const randomVehicleTypeIndex = Math.floor(Math.random() * 3);
      const randomLicensePlate = `${faker.datatype.number({
        min: 15,
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
        registrationLocation: vehicleRegLocation,
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
        vehicleOwnerCid: ownersIds[randomOwnerIndex],
        registrationCenterId: registrationCentersIds[randomCenterIndex],
        // registrationCenterId: '654321',
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

  /**Convert JSON data obtained from excel file to a JSON that can be used as a parameter to the insertMany method of MongoDB */
  async remodelJsonData(json: any[]): Promise<IVehicle[]> {
    const existingVehicles = await this.findAll();
    const ownerCids = await this.vehicleOwnerService.getAllOwnerCids();
    const allCenters = await this.registrationCenterService.findAll();
    const provinces = await this.provinceService.getProvinces();
    const newOwners: IVehicleOwner[] = [];
    const newVehicles: IVehicle[] = [];
    const existingVehiclesLicensePlates: string[] = existingVehicles.map(
      (vehicle) => vehicle.licensePlate,
    );
    const existingVehiclesVins: string[] = existingVehicles.map(
      (vehicle) => vehicle.vin,
    );

    json.map((data: any) => {
      // check if the excel file is valid (has all the correct fields or not)
      if (!excelJsonChecker(data)) {
        throw new BadRequestException(
          'Invalid excel file. Please check the file and try again.',
        );
      }
      // check for existing license plates and vins
      if (existingVehiclesLicensePlates.includes(data.licensePlate)) {
        throw new BadRequestException(
          `License plate ${data.licensePlate} already exists.`,
        );
      } else {
        existingVehiclesLicensePlates.push(data.licensePlate);
      }
      if (existingVehiclesVins.includes(data.vin)) {
        throw new BadRequestException(`VIN ${data.vin} already exists.`);
      } else {
        existingVehiclesVins.push(data.vin);
      }

      const currentCenter: RegistrationCenter | undefined = allCenters.find(
        (center) => center.centerId === data.registrationCenterId,
      );
      if (!currentCenter) {
        throw new BadRequestException(
          `Registration center ${data.registrationCenterId} does not exist.`,
        );
      }

      const newVehicle: IVehicle = {
        licensePlate: data.licensePlate,
        vehicleType: data.vehicleType,
        vin: data.vin,
        manufacturer: data.manufacturer,
        model: data.model,
        version: data.version.toString(),
        registrationNumber: data.registrationNumber,
        registrationDate: isIsoString(data.registrationDate)
          ? data.registrationDate
          : new Date(getJsDateFromExcel(data.registrationDate)).toISOString(),
        registrationCenterId: data.registrationCenterId.toString(),
        registrationLocation: getRegistrationCenterFullAdress(
          currentCenter,
          provinces,
        ),
        purpose: data.purpose,
        width: data.width,
        length: data.length,
        wheelBase: data.wheelBase,
        emission: data.emission,
        mileage: data.mileage,
        vehicleOwnerCid: data.vehicleOwnerCid.toString(),
      };

      if (!ownerCids.includes(data.vehicleOwnerCid.toString())) {
        const newOwner: IVehicleOwner = {
          cid: data.vehicleOwnerCid.toString(),
          name: data.ownerName,
          address: data.ownerAddress,
          ownerType: data.ownerType,
          dob: isIsoString(data.ownerDob)
            ? data.ownerDob
            : new Date(getJsDateFromExcel(data.ownerDob)).toISOString(),
          phoneNumber: data.ownerPhoneNumber,
        };
        newOwners.push(newOwner);
        ownerCids.push(data.vehicleOwnerCid.toString());
      }

      newVehicles.push(newVehicle);
    });

    // add new owner to the database
    if (newOwners.length > 0) {
      await this.vehicleOwnerService.createMany(newOwners);
    }

    return newVehicles;
  }
}

/**Get the find filter by date */
function getFindFilterByDate(
  filter: string,
  centerId: string | string[],
  startDate?: string,
  endDate?: string,
  vehicleType?: string,
  getNearExpired?: boolean,
  provinceCode?: number,
  districtCode?: number,
) {
  let findFilter = { $and: [] };
  if (!getNearExpired) {
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
        ],
      };
    } else if (filter === Flags.FILTER_BY_YEAR) {
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
        ],
      };
    }
  }

  if (centerId) {
    findFilter['$and'].push({
      'registrationInformation.centerId':
        typeof centerId === 'string' ? centerId : { $in: centerId },
    });
  }

  if (vehicleType) {
    findFilter['$and'].push({ vehicleType: vehicleType });
  }

  if (getNearExpired) {
    const currentDate = new Date();
    const nextMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1),
    );
    findFilter['$and'].push(
      ...[
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
      ],
    );
  }

  if (provinceCode) {
    findFilter['$and'].push({
      'registrationInformation.provinceCode': provinceCode,
    });
  }

  if (districtCode) {
    findFilter['$and'].push({
      'registrationInformation.districtCode': districtCode,
    });
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

function getRegistrationCenterFullAdress(
  registrationCenter: RegistrationCenter,
  provinceInfos: any,
): string {
  const province = provinceInfos.find(
    (province) => province.code === registrationCenter.provinceCode,
  );
  const district = province.districts.find(
    (district) => district.code === registrationCenter.districtCode,
  );
  return `${province.name}, ${district.name}, ${registrationCenter.location}`;
}
