import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationCenterModule } from './registration-center/registration-center.module';
import { RegistrationDepModule } from './registration-dep/registration-dep.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { VehicleOwnerModule } from './vehicle-owner/vehicle-owner.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // MongooseModule.forRoot(
    //   'mongodb+srv://votindu26062003:tindu2003@cluster0.dnlr7.mongodb.net/?retryWrites=true&w=majority',
    // ),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DB_PATH'),
      }),
    }),
    RegistrationCenterModule,
    RegistrationDepModule,
    VehicleModule,
    VehicleOwnerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
