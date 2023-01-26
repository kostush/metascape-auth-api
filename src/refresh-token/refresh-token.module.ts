import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ParamsModule } from '../params/params.module';
import PARAMETERS from '../params/params.constants';
import { RefreshTokenFactoryInterface } from './factory/refresh-token-factory.interface';
import { RefreshTokenFactoryService } from './factory/refresh-token-factory.service';
import { RefreshTokenInterface } from './services/refresh-token.interface';
import { RefreshTokenService } from './services/refresh-token.service';
import { Algorithm } from 'jsonwebtoken';

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
      async useFactory(
        JWT_REFRESH_ALGORITHM: Algorithm,
        JWT_REFRESH_EXPIRES_IN: string,
        JWT_REFRESH_SECRET: string,
      ) {
        return {
          signOptions: {
            algorithm: JWT_REFRESH_ALGORITHM,
            expiresIn: JWT_REFRESH_EXPIRES_IN,
          },
          secret: JWT_REFRESH_SECRET,
          validateOptions: { algorithms: [JWT_REFRESH_ALGORITHM] },
        };
      },
      inject: [
        PARAMETERS.JWT_REFRESH_ALGORITHM,
        PARAMETERS.JWT_REFRESH_EXPIRES_IN,
        PARAMETERS.JWT_REFRESH_SECRET,
      ],
    }),
  ],
})
export class RefreshTokenModule {}
