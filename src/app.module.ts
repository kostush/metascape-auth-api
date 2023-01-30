import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './params/validation.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GrpcExceptionFilter } from 'metascape-common-api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParamsModule } from './params/params.module';
import PARAMETERS from './params/params.constants';

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema }),
    TypeOrmModule.forRootAsync({
      imports: [ParamsModule],
      useFactory: (
        DB_HOST: string,
        DB_PORT: number,
        DB_USER: string,
        DB_PASSWORD: string,
        DB_NAME: string,
      ) => {
        return {
          type: 'postgres',
          host: DB_HOST,
          port: DB_PORT,
          username: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
      inject: [
        PARAMETERS.DB_HOST,
        PARAMETERS.DB_PORT,
        PARAMETERS.DB_USER,
        PARAMETERS.DB_PASSWORD,
        PARAMETERS.DB_NAME,
      ],
    }),
    AuthModule,
  ],
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
