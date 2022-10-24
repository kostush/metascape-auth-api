import { Module } from '@nestjs/common';
import { ParamsModule } from '../params/params.module';
import { RegisterByEmailController } from './controllers/register-by-email.controller';
import {
  UserApiClientFactory,
  USERS_SERVICE_NAME,
} from 'metascape-user-api-client';
import PARAMETERS from '../params/params.constants';
import { RegisterByEmailUseCase } from './use-case/register-by-email.use-case';
import { RegisterByWalletController } from './controllers/register-by-wallet.controller';
import { RegisterByWalletUseCase } from './use-case/register-by-wallet.use-case';
import { LoginByWalletController } from './controllers/login-by-wallet.controller';
import { LoginByEmailController } from './controllers/login-by-email.controller';
import { LoginByWalletUseCase } from './use-case/login-by-wallet.use-case';
import { LoginByEmailUseCase } from './use-case/login-by-email.use-case';
import { JwtModule } from '@nestjs/jwt';
import { ValidateUseCase } from './use-case/validate.use-case';
import { ValidateController } from './controllers/validate.controller';
import {
  WalletApiClientFactory,
  WALLETS_SERVICE_NAME,
} from 'metascape-wallet-api-client';
import { JwtPayloadFactoryService } from './factory/jwt-payload-factory.service';
import { JwtPayloadFactoryInterface } from './factory/jwt-payload-factory.interface';
import { WalletResponseFactoryInterface } from './factory/wallet-response-factory.interface';
import { WalletResponseFactory } from './factory/wallet-response-factory.service';

@Module({
  controllers: [
    RegisterByEmailController,
    RegisterByWalletController,
    LoginByWalletController,
    LoginByEmailController,
    ValidateController,
  ],
  providers: [
    {
      provide: USERS_SERVICE_NAME,
      useFactory: (userApiUrl: string) => {
        return UserApiClientFactory.create(userApiUrl);
      },
      inject: [PARAMETERS.USER_API_GRPC_URL],
    },
    {
      provide: WALLETS_SERVICE_NAME,
      useFactory: (walletApiUrl: string) => {
        return WalletApiClientFactory.create(walletApiUrl);
      },
      inject: [PARAMETERS.WALLET_API_GRPC_URL],
    },
    {
      provide: JwtPayloadFactoryInterface,
      useClass: JwtPayloadFactoryService,
    },
    {
      provide: WalletResponseFactoryInterface,
      useClass: WalletResponseFactory,
    },
    RegisterByEmailUseCase,
    RegisterByWalletUseCase,
    LoginByWalletUseCase,
    LoginByEmailUseCase,
    ValidateUseCase,
  ],
  imports: [
    ParamsModule,
    JwtModule.registerAsync({
      imports: [ParamsModule],
      useFactory: async (
        JWT_PRIVATE_KEY: string,
        JWT_PUBLIC_KEY: string,
        JWT_EXPIRES_IN: string,
        JWT_ALGORITHM: any,
      ) => ({
        privateKey: JWT_PRIVATE_KEY,
        publicKey: JWT_PUBLIC_KEY,
        signOptions: { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN },
        validateOptions: { algorithms: [JWT_ALGORITHM] },
      }),
      inject: [
        PARAMETERS.JWT_PRIVATE_KEY,
        PARAMETERS.JWT_PUBLIC_KEY,
        PARAMETERS.JWT_EXPIRES_IN,
        PARAMETERS.JWT_ALGORITHM,
      ],
    }),
  ],
})
export class AuthModule {}
