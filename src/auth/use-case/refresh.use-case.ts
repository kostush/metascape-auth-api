import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { lastValueFrom } from 'rxjs';
import { JwtPayloadFactoryInterface } from '../factory/jwt-payload-factory.interface';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../refresh-token/services/refresh-token.interface';
import { RefreshRequest } from '../requests/refresh.request';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { TokenIsClosedException } from '../exceptions/token-is-closed.exception';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(JwtPayloadFactoryInterface)
    private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
    @Inject(SessionFactoryInterface)
    private readonly sessionFactory: SessionFactoryInterface,
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
    @Inject(TokenFactoryInterface)
    private readonly tokenFactory: TokenFactoryInterface,
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
    @Inject(RefreshTokenInterface)
    private readonly refreshTokenService: RefreshTokenInterface,
  ) {}

  async execute(
    request: RefreshRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    let refreshTokenDto;
    try {
      refreshTokenDto = this.refreshTokenService.verify(request.refreshToken);
    } catch (e) {
      throw new BadRequestException('Refresh token is not valid or expired');
    }

    const token = await this.tokenRepository.getOneById(
      refreshTokenDto.tokenId,
      true,
    );
    if (token.isClosed || token.session!.isClosed) {
      throw new TokenIsClosedException(
        `Token ${refreshTokenDto.tokenId} is closed`,
      );
    }
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({
        id: token.session!.userId,
      }),
    );
    const newSession = this.sessionFactory.createSession(userData.data!.id);
    const newToken = this.tokenFactory.createToken(newSession.id);
    newSession.tokens = [newToken];

    await this.sessionRepository.insert(newSession);

    const payload = this.jwtPayloadFactory.createJwtPayload(
      userData.data!,
      newSession.id,
      token.id,
    );
    const authJwt = this.authTokenService.sign(payload);
    const refreshJwt = this.refreshTokenService.sign({
      tokenId: payload.tokenId,
    });
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  }
}
