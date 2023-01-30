import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { lastValueFrom } from 'rxjs';
import { LoginByWalletRequest } from '../requests/login-by-wallet.request';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { WalletNotAttachedToUserException } from '../exceptions/wallet-not-attached-to-user.exception';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { LoginResponseFactoryInterface } from '../factory/login-response-factory.interface';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../refresh-token/services/refresh-token.interface';
import { RefreshTokenFactoryInterface } from '../../refresh-token/factory/refresh-token-factory.interface';
import { AuthTokenFactoryInterface } from '../../auth-token/factory/auth-token-factory.interface';

@Injectable()
export class LoginByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
    @Inject(SessionFactoryInterface)
    private readonly sessionFactory: SessionFactoryInterface,
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
    @Inject(TokenFactoryInterface)
    private readonly tokenFactory: TokenFactoryInterface,
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
  ) {}

  async execute(
    request: LoginByWalletRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    const walletData = await lastValueFrom(
      this.walletsServiceClient.signNonce({
        businessId: request.businessId,
        address: request.address,
        signature: request.signature,
      }),
    );
    if (!walletData.data!.userId) {
      throw new WalletNotAttachedToUserException(
        `Wallet with ${request.address} is not attached to any user`,
      );
    }
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({ id: walletData.data!.userId }),
    );

    const session = this.sessionFactory.createSession(userData.data!.id);
    const token = this.tokenFactory.createToken(session.id);
    await this.sessionRepository.insert(session);
    await this.tokenRepository.insert(token);
    const authPayload = this.authTokenFactoryService.createPayload(
      userData.data!,
      session.id,
      token.id,
    );
    const refreshPayload = this.refreshTokenFactoryService.createPayload(
      token.id,
    );
    const authJwt = this.authTokenFactoryService.createToken(authPayload);
    const refreshJwt =
      this.refreshTokenFactoryService.createToken(refreshPayload);

    return this.loginResponseFactory.createLoginResponse(authJwt, refreshJwt);
  }
}
