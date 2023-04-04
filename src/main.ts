import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

const port = parseInt(process.env.PORT) || 4000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  app.setGlobalPrefix('api');
}
bootstrap();
