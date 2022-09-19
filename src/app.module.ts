import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './params/validation.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GrpcExceptionFilter } from 'metascape-common-api';

@Module({
  imports: [ConfigModule.forRoot({ validationSchema }), AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({ whitelist: true, transform: true }),
    },
    {
      provide: APP_FILTER,
      useFactory: () => new GrpcExceptionFilter(),
    },
  ],
})
export class AppModule {}
