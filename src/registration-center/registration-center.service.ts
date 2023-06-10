import { Model } from 'mongoose';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistrationCenter,
  RegistrationCenterDocument,
} from 'src/schemas/registration-center.schema';
import { IRegistrationCenter } from '../interfaces/registrationCenter.interface';
import { RegistrationDepService } from '../registration-dep/registration-dep.service';
import { faker } from '@faker-js/faker';
import { ObjectId } from 'bson';
import * as bcrypt from 'bcrypt';
import { ProvinceService } from 'src/province/province.service';
import getRegistrationCenterFullAddress from 'src/utils/getRegistrationCenterFullAddress';

@Injectable()
export class RegistrationCenterService {
  constructor(
    @InjectModel(RegistrationCenter.name)
    private registrationCenterModel: Model<RegistrationCenterDocument>,
    private registrationDepService: RegistrationDepService,
    private provinceService: ProvinceService,
  ) {}

  async findAll(): Promise<RegistrationCenter[]> {
    return this.registrationCenterModel.find().exec();
  }

  async findByCenterId(centerId: string): Promise<RegistrationCenter> {
    return this.registrationCenterModel.findOne({ centerId: centerId }).exec();
  }

  async findByDepId(depId: string): Promise<RegistrationCenter[]> {
    return this.registrationCenterModel.find({ registrationDep: depId }).exec();
  }

  async getProfile(req: any): Promise<RegistrationCenter> {
    const center: RegistrationCenter = await this.registrationCenterModel
      .findOne({ _id: req.data._id })
      .exec();
    if (center) {
      return center;
    } else {
      throw new NotAcceptableException('Center does not exist');
    }
  }

  async updateProfile(req: any, data: IRegistrationCenter) {
    const center: RegistrationCenter = await this.registrationCenterModel
      .findOne({ _id: req.data._id })
      .exec();

    if (center) {
      if (data.password) {
        const salt = await bcrypt.genSalt();
        data.password = await bcrypt.hash(data.password, salt);
      }
      return this.registrationCenterModel
        .findOneAndUpdate({ _id: req.data._id }, data, {
          returnOriginal: false,
        })
        .exec();
    } else {
      throw new NotAcceptableException('Center does not exist');
    }
  }

  async create(
    registrationCenter: IRegistrationCenter,
  ): Promise<RegistrationCenter> {
    const centerIds = (await this.registrationCenterModel.find().exec()).map(
      (center) => center.centerId.toString(),
    );

    if (centerIds.includes(registrationCenter.centerId)) {
      throw new NotAcceptableException('Center ID already exists');
    }

    const salt = await bcrypt.genSalt();
    registrationCenter = {
      ...registrationCenter,
      password: await bcrypt.hash(registrationCenter.password, salt),
      fullAdress: getRegistrationCenterFullAddress(
        registrationCenter,
        await this.provinceService.getProvinces(),
      ),
    };
    const createdCenter = new this.registrationCenterModel(registrationCenter);
    return createdCenter.save();
  }

  // development only: update all centers' full address
  async updateAllCenterFullAddress(): Promise<void> {
    const centers = await this.registrationCenterModel.find().exec();
    const provinces = await this.provinceService.getProvinces();
    centers.map(async (center) => {
      center.fullAdress = getRegistrationCenterFullAddress(center, provinces);
      await center.save();
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.registrationCenterModel.findByIdAndDelete(id).catch((error) => {
      throw error;
    });
  }

  async genFakeData(): Promise<void> {
    const fakeData: IRegistrationCenter[] = [];

    // get all dep IDs
    const deps: any[] = await this.registrationDepService.findAll();
    const depsIds: string[] = deps.map((dep) => dep._id.toString());

    const provinces = await this.provinceService.getProvinces();

    for (let i = 0; i < 200; i++) {
      const randomProvinceIndex = faker.datatype.number({
        min: 0,
        max: provinces.length - 1,
      });

      const randomDistrictIndex = faker.datatype.number({
        min: 0,
        max: provinces[randomProvinceIndex].districts.length - 1,
      });
      // get a random dep ID for registrationDep field
      const randomIndex = Math.floor(Math.random() * depsIds.length);
      fakeData.push({
        _id: new ObjectId().toString(),
        centerId: faker.datatype
          .number({ min: 100000, max: 999999 })
          .toString(),
        password: await bcrypt.hash(faker.internet.password(8, true), 10),
        name: faker.company.catchPhrase(),
        provinceCode: provinces[randomProvinceIndex].code,
        districtCode:
          provinces[randomProvinceIndex].districts[randomDistrictIndex].code,
        location: faker.address.city(),
        phoneNumber: faker.phone.number('09########'),
        registrationDep: depsIds[randomIndex],
      });
    }
    await this.registrationCenterModel.insertMany(fakeData);
  }

  async deleteAllFakeData(): Promise<void> {
    await this.registrationCenterModel.deleteMany({});
  }
}
