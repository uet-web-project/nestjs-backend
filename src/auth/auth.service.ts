import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegistrationCenterService } from '../registration-center/registration-center.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private registrationCenterService: RegistrationCenterService,
    private jwtService: JwtService,
  ) {}
  async regCenterLogin(centerId: string, pass: string): Promise<any> {
    const center = await this.registrationCenterService.findByCenterId(
      centerId,
    );
    if (center?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = {
      name: center?.name,
      centerId: centerId,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = center;
    // TODO: generate JWT and return it
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
