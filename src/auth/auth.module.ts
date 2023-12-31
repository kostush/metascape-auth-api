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
import { ValidateUseCase } from './use-case/validate.use-case';
import { ValidateController } from './controllers/validate.controller';
import { RefreshController } from './controllers/refresh.controller';
import {
  WalletApiClientFactory,
  WALLETS_SERVICE_NAME,
} from 'metascape-wallet-api-client';
import { WalletResponseFactoryInterface } from './factory/wallet-response-factory.interface';
import { WalletResponseFactory } from './factory/wallet-response-factory.service';
import { SessionRepositoryInterface } from './repositories/session-repository.interface';
import { SessionFactoryInterface } from './factory/session-factory.interface';
import { SessionFactory } from './factory/session-factory.service';
import { TokenFactoryInterface } from './factory/token-factory.interface';
import { TokenFactory } from './factory/token-factory.service';
import { SessionRepository } from './repositories/session-repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionSchema } from './schemas/session.schema';
import { TokenSchema } from './schemas/token.schema';
import { SharedModule } from 'metascape-common-api';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { AuthTokenModule } from '../auth-token/auth-token.module';
import { TokenRepositoryInterface } from './repositories/token-repository.interface';
import { TokenRepository } from './repositories/token-repository.service';
import { RefreshUseCase } from './use-case/refresh.use-case';
import { LoginResponseFactoryInterface } from './factory/login-response-factory.interface';
import { LoginResponseFactoryService } from './factory/login-response-factory.service';
import { CloseSessionUseCase } from './use-case/close-session.use-case';
import { CloseSessionController } from './controllers/close-session.controller';
import { SessionClientModule } from 'metascape-session-client';
import { CloseAllUserSessionsController } from './controllers/close-all-user-sessions.controller';
import { CloseAllUserSessionsUseCase } from './use-case/close-all-user-sessions.use-case';
import { SessionExpiredPeriodInterface } from './services/session-expired-period-interface';
import { SessionExpiredPeriodService } from './services/session-expired-period-service';

@Module({
  controllers: [
    RegisterByEmailController,
    RegisterByWalletController,
    LoginByWalletController,
    LoginByEmailController,
    ValidateController,
    RefreshController,
    CloseSessionController,
    CloseAllUserSessionsController,
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
      provide: WalletResponseFactoryInterface,
      useClass: WalletResponseFactory,
    },
    {
      provide: SessionFactoryInterface,
      useClass: SessionFactory,
    },
    {
      provide: TokenFactoryInterface,
      useClass: TokenFactory,
    },
    {
      provide: SessionRepositoryInterface,
      useClass: SessionRepository,
    },
    {
      provide: TokenRepositoryInterface,
      useClass: TokenRepository,
    },
    {
      provide: LoginResponseFactoryInterface,
      useClass: LoginResponseFactoryService,
    },
    {
      provide: SessionExpiredPeriodInterface,
      useClass: SessionExpiredPeriodService,
    },
    RegisterByEmailUseCase,
    RegisterByWalletUseCase,
    LoginByWalletUseCase,
    LoginByEmailUseCase,
    ValidateUseCase,
    RefreshUseCase,
    CloseSessionUseCase,
    CloseAllUserSessionsUseCase,
  ],
  imports: [
    ParamsModule,
    TypeOrmModule.forFeature([SessionSchema, TokenSchema]),
    SharedModule,
    RefreshTokenModule,
    AuthTokenModule,
    SessionClientModule.registerAsync({
      useFactory: (
        REDIS_HOST: string,
        REDIS_PORT: number,
        REDIS_USER: string,
        REDIS_PASSWORD: string,
      ) => {
        return {
          socket: { host: REDIS_HOST, port: REDIS_PORT },
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
  ],
})
export class AuthModule {}
