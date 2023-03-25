import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { GrpcException, SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { LoginByEmailRequest } from '../requests/login-by-email.request';
import { lastValueFrom } from 'rxjs';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import { LoginResponseFactoryInterface } from '../factory/login-response-factory.interface';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../refresh-token/services/refresh-token.interface';
import { AuthTokenFactoryInterface } from '../../auth-token/factory/auth-token-factory.interface';
import { RefreshTokenFactoryInterface } from '../../refresh-token/factory/refresh-token-factory.interface';
import { SessionClient } from 'metascape-session-client';
import { status } from '@grpc/grpc-js';

@Injectable()
export class LoginByEmailUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
    @Inject(SessionFactoryInterface)
    private readonly sessionFactory: SessionFactoryInterface,
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenFactoryInterface)
    private readonly tokenFactory: TokenFactoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
    @Inject(LoginResponseFactoryInterface)
    private readonly loginResponseFactory: LoginResponseFactoryInterface,
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
    @Inject(RefreshTokenInterface)
    private readonly refreshTokenService: RefreshTokenInterface,
    @Inject(RefreshTokenFactoryInterface)
    private readonly refreshTokenFactoryService: RefreshTokenFactoryInterface,
    @Inject(AuthTokenFactoryInterface)
    private readonly authTokenFactoryService: AuthTokenFactoryInterface,
    @Inject(SessionClient)
    private readonly sessionRedisClient: SessionClient,
  ) {}

  async execute(
    request: LoginByEmailRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    let userData;
    try {
      userData = await lastValueFrom(
        this.usersServiceClient.getUserByEmailAndPassword({
          businessId: request.businessId,
          email: request.email,
          password: request.password,
        }),
      );
    } catch (e) {
      if (e instanceof GrpcException && e.code == status.NOT_FOUND) {
        throw new ForbiddenException('email or password is wrong.');
      }
      throw e;
    }

    const session = this.sessionFactory.createSession(userData!.data!.id);
    const token = this.tokenFactory.createToken(session.id);
    session.tokens = [token];

    await this.sessionRedisClient.setSession(session.id, token.id);
    await this.sessionRepository.save(session);

    const authPayload = this.authTokenFactoryService.createPayload(
      userData.data!,
      session.id,
      token.id,
    );
    const refreshPayload = this.refreshTokenFactoryService.createPayload(
      token.id,
    );
    const authJwt = this.authTokenService.sign(authPayload);
    const refreshJwt = this.refreshTokenService.sign(refreshPayload);

    return this.loginResponseFactory.createLoginResponse(authJwt, refreshJwt);
  }
}
