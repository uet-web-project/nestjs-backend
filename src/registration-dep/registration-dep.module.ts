import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationDep,
  RegistrationDepSchema,
} from '../schemas/registration-dep.schema';
import { RegistrationDepService } from './registration-dep.service';
import { RegistrationDepController } from './registration-dep.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationDep.name, schema: RegistrationDepSchema },
    ]),
  ],
  providers: [RegistrationDepService],
  controllers: [RegistrationDepController],
  exports: [RegistrationDepService],
})
export class RegistrationDepModule {}
