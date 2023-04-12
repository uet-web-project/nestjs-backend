import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationCenterModule } from './registration-center/registration-center.module';
import { RegistrationDepModule } from './registration-dep/registration-dep.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { VehicleOwnerModule } from './vehicle-owner/vehicle-owner.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://votindu26062003:tindu2003@cluster0.dnlr7.mongodb.net/?retryWrites=true&w=majority',
    ),
    RegistrationDepModule,
    RegistrationCenterModule,
    VehicleModule,
    VehicleOwnerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
