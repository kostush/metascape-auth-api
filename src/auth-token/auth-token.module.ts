import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ParamsModule } from '../params/params.module';
import PARAMETERS from '../params/params.constants';
import { AuthTokenFactoryInterface } from './factory/auth-token-factory.interface';
import { AuthTokenFactoryService } from './factory/auth-token-factory.service';
import { AuthTokenInterface } from './services/auth-token.interface';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  providers: [
    {
      provide: AuthTokenFactoryInterface,
      useClass: AuthTokenFactoryService,
    },
    {
      provide: AuthTokenInterface,
      useClass: AuthTokenService,
    },
  ],
  exports: [
    {
      provide: AuthTokenFactoryInterface,
      useClass: AuthTokenFactoryService,
    },
    {
      provide: AuthTokenInterface,
      useClass: AuthTokenService,
    },
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ParamsModule],
      useFactory: async (
        JWT_AUTH_PRIVATE_KEY: string,
        JWT_AUTH_PUBLIC_KEY: string,
        JWT_AUTH_EXPIRES_IN: string,
        JWT_ALGORITHM: any,
      ) => ({
        privateKey: JWT_AUTH_PRIVATE_KEY,
        publicKey: JWT_AUTH_PUBLIC_KEY,
        signOptions: {
          algorithm: JWT_ALGORITHM,
          expiresIn: JWT_AUTH_EXPIRES_IN,
        },
        validateOptions: { algorithms: [JWT_ALGORITHM] },
      }),
      inject: [
        PARAMETERS.JWT_AUTH_PRIVATE_KEY,
        PARAMETERS.JWT_AUTH_PUBLIC_KEY,
        PARAMETERS.JWT_AUTH_EXPIRES_IN,
        PARAMETERS.JWT_ALGORITHM,
      ],
    }),
  ],
})
export class AuthTokenModule {}
