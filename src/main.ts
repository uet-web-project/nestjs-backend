import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

const port = process.env.PORT || 4000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  await app.listen(port);
}
bootstrap();
