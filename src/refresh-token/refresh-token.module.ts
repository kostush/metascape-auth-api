import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ParamsModule } from '../params/params.module';
import PARAMETERS from '../params/params.constants';
import { RefreshTokenFactoryInterface } from './factory/refresh-token-factory.interface';
import { RefreshTokenFactoryService } from './factory/refresh-token-factory.service';
import { RefreshTokenInterface } from './services/refresh-token.interface';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  providers: [
    {
      provide: RefreshTokenFactoryInterface,
      useClass: RefreshTokenFactoryService,
    },
    {
      provide: RefreshTokenInterface,
      useClass: RefreshTokenService,
    },
  ],
  exports: [
    {
      provide: RefreshTokenFactoryInterface,
      useClass: RefreshTokenFactoryService,
    },
    {
      provide: RefreshTokenInterface,
      useClass: RefreshTokenService,
    },
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ParamsModule],
      useFactory: async (
        JWT_REFRESH_PRIVATE_KEY: string,
        JWT_REFRESH_PUBLIC_KEY: string,
        JWT_REFRESH_EXPIRES_IN: string,
        JWT_ALGORITHM: any,
      ) => ({
        privateKey: JWT_REFRESH_PRIVATE_KEY,
        publicKey: JWT_REFRESH_PUBLIC_KEY,
        signOptions: {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_REFRESH_EXPIRES_IN,
        },
        validateOptions: { algorithms: [JWT_ALGORITHM] },
      }),
      inject: [
        PARAMETERS.JWT_REFRESH_PRIVATE_KEY,
        PARAMETERS.JWT_REFRESH_PUBLIC_KEY,
        PARAMETERS.JWT_REFRESH_EXPIRES_IN,
        PARAMETERS.JWT_ALGORITHM,
      ],
    }),
  ],
})
export class RefreshTokenModule {}
