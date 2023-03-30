import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RegistrationDep,
  RegistrationDepSchema,
} from '../schemas/registrationDep.schema';
import { RegistrationDepService } from '../services/registryDep.service';
import { RegistrationDepController } from '../controllers/registrationDep.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistrationDep.name, schema: RegistrationDepSchema },
    ]),
  ],
  providers: [RegistrationDepService],
  controllers: [RegistrationDepController],
})
export class RegistrationDepModule {}
