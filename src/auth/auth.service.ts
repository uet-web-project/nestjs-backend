import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegistrationCenterService } from '../registration-center/registration-center.service';
import { RegistrationDepService } from '../registration-dep/registration-dep.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private registrationCenterService: RegistrationCenterService,
    private registrationDepService: RegistrationDepService,
    private jwtService: JwtService,
  ) {}

  async regDepLogin(depName: string, pass: string): Promise<any> {
    const dep: any = await this.registrationDepService.findByDepName(depName);
    if (dep?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = {
      _id: dep?._id,
      name: dep?.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async regCenterLogin(centerId: string, pass: string): Promise<any> {
    const center: any = await this.registrationCenterService.findByCenterId(
      centerId,
    );
    if (center?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = {
      _id: center?._id,
      centerId: center?.centerId,
      name: center?.name,
      location: center?.location,
      phoneNumber: center?.phoneNumber,
      registrationDep: center?.registrationDep,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async checkToken(token: string): Promise<any> {
    console.log(process.env.JWT_SECRET);

    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}