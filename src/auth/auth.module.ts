import { Module } from '@nestjs/common';
import { RegistrationCenterModule } from '../registration-center/registration-center.module';
import { RegistrationDepModule } from '../registration-dep/registration-dep.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    RegistrationCenterModule,
    RegistrationDepModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || jwtConstants.secret,
      signOptions: { expiresIn: '1 day' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
