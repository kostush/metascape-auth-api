import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './params/validation.schema';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  GrpcExceptionFilter,
  OgmaModuleConfigFactory,
  NODE_ENV,
} from 'metascape-common-api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParamsModule } from './params/params.module';
import PARAMETERS from './params/params.constants';
import { OgmaInterceptor, OgmaModule, OgmaService } from '@ogma/nestjs-module';
import { SessionClientModule } from 'metascape-session-client/dist/session-client.module';

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
    OgmaModule.forRootAsync({
      useFactory: (
        LOGGER_LEVEL?: string,
        LOGGER_TRANSPORT_CONSOLE_IS_USED?: boolean,
        LOGGER_TRANSPORT_CONSOLE_LEVEL?: string,
        LOGGER_TRANSPORT_FILE_FILENAME?: string,
        LOGGER_TRANSPORT_FILE_LEVEL?: string,
        LOGGER_TRANSPORT_LOGSTASH_HOST?: string,
        LOGGER_TRANSPORT_LOGSTASH_PORT?: number,
        LOGGER_TRANSPORT_LOGSTASH_LEVEL?: string,
        LOGGER_TRANSPORT_LOGSTASH_MAX_CONNECT_RETRIES?: number,
      ) => {
        return OgmaModuleConfigFactory.createGrpcModuleConfig({
          logLevel: LOGGER_LEVEL,
          transport: {
            console: LOGGER_TRANSPORT_CONSOLE_IS_USED
              ? { level: LOGGER_TRANSPORT_CONSOLE_LEVEL }
              : undefined,
            file: {
              filename: LOGGER_TRANSPORT_FILE_FILENAME,
              level: LOGGER_TRANSPORT_FILE_LEVEL,
            },
            logstash: {
              host: LOGGER_TRANSPORT_LOGSTASH_HOST,
              port: LOGGER_TRANSPORT_LOGSTASH_PORT,
              level: LOGGER_TRANSPORT_LOGSTASH_LEVEL,
              maxConnectRetries: LOGGER_TRANSPORT_LOGSTASH_MAX_CONNECT_RETRIES,
            },
          },
          appName: 'metascape-auth-api',
          masks: ['password', 'authToken', 'refreshToken', 'signature'],
        });
      },
      inject: [
        PARAMETERS.LOGGER_LEVEL,
        PARAMETERS.LOGGER_TRANSPORT_CONSOLE_IS_USED,
        PARAMETERS.LOGGER_TRANSPORT_CONSOLE_LEVEL,
        PARAMETERS.LOGGER_TRANSPORT_FILE_FILENAME,
        PARAMETERS.LOGGER_TRANSPORT_FILE_LEVEL,
        PARAMETERS.LOGGER_TRANSPORT_LOGSTASH_HOST,
        PARAMETERS.LOGGER_TRANSPORT_LOGSTASH_PORT,
        PARAMETERS.LOGGER_TRANSPORT_LOGSTASH_LEVEL,
        PARAMETERS.LOGGER_TRANSPORT_LOGSTASH_MAX_CONNECT_RETRIES,
      ],
      imports: [ParamsModule],
    }),
    SessionClientModule.registerAsync({
      useFactory: (
        REDIS_HOST: string,
        REDIS_PORT: number,
        REDIS_USER: string,
        REDIS_PASSWORD: string,
      ) => {
        return {
          host: REDIS_HOST,
          port: REDIS_PORT,
          username: REDIS_USER,
          password: REDIS_PASSWORD,
        };
      },
      inject: [
        PARAMETERS.REDIS_HOST,
        PARAMETERS.REDIS_PORT,
        PARAMETERS.REDIS_USER,
        PARAMETERS.REDIS_PASSWORD,
      ],
      imports: [ParamsModule],
    }),
    ParamsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({ whitelist: true, transform: true }),
    },
    {
      provide: APP_FILTER,
      useFactory: (NODE_ENV: NODE_ENV, ogmaService: OgmaService) =>
        new GrpcExceptionFilter(NODE_ENV, ogmaService),
      inject: [PARAMETERS.NODE_ENV, OgmaService],
    },
  ],
})
export class AppModule {}
