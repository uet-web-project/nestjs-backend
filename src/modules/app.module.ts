import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { RegistrationCenterModule } from './registrationCenter.module';
import { RegistrationDepModule } from './registrationDep.module';
import { VehicleModule } from './vehicle.module';
import { VehicleOwnerModule } from './vehicleOwner.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://votindu26062003:tindu2003@cluster0.dnlr7.mongodb.net/?retryWrites=true&w=majority',
    ),
    RegistrationDepModule,
    RegistrationCenterModule,
    VehicleModule,
    VehicleOwnerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
