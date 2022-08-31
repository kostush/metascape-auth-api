import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { grpcConfigs } from './main.config';

async function bootstrap() {
  const microservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      grpcConfigs,
    );

  await microservice.listen();
}
bootstrap();
