import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { lastValueFrom } from 'rxjs';
import { LoginByWalletRequest } from '../requests/login-by-wallet.request';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { JwtService } from '@nestjs/jwt';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { JwtPayloadFactoryInterface } from '../factory/jwt-payload-factory.interface';
import { WalletNotAttachedToUserException } from '../exceptions/wallet-not-attached-to-user.exception';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';

@Injectable()
export class LoginByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
    @Inject(JwtPayloadFactoryInterface)
    private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
    private readonly jwtService: JwtService,
    @Inject(SessionFactoryInterface)
    private readonly sessionFactory: SessionFactoryInterface,
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenFactoryInterface)
    private readonly tokenFactory: TokenFactoryInterface,
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
    session.tokens = [token];

    await this.sessionRepository.insert(session);
    const payload = this.jwtPayloadFactory.createJwtPayload(
      userData.data!,
      session.id,
      token.id,
    );
    const jwt = this.jwtService.sign(payload);

    return new SuccessResponse(new LoginResponseDataDto(jwt));
  }
}
