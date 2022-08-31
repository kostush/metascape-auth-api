import { Module } from '@nestjs/common';
import { ParamsModule } from '../params/params.module';
import { RegisterByEmailController } from './controllers/register-by-email.controller';
import {
  UserApiClientFactory,
  USERS_SERVICE_NAME,
} from 'metascape-user-api-client/dist';
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
      useFactory: async (JWT_SECRET: string, JWT_EXPIRES_IN: string) => ({
        secret: JWT_SECRET,
        signOptions: { expiresIn: JWT_EXPIRES_IN },
      }),
      inject: [PARAMETERS.JWT_SECRET, PARAMETERS.JWT_EXPIRES_IN],
    }),
  ],
})
export class AuthModule {}
