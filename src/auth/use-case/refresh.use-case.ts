import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { lastValueFrom } from 'rxjs';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import { RefreshTokenInterface } from '../../refresh-token/services/refresh-token.interface';
import { RefreshRequest } from '../requests/refresh.request';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { TokenIsClosedException } from '../exceptions/token-is-closed.exception';
import { LoginResponseFactoryInterface } from '../factory/login-response-factory.interface';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';
import { SessionIsClosedException } from '../exceptions/session-is-closed.exception';
import { RefreshTokenFactoryInterface } from '../../refresh-token/factory/refresh-token-factory.interface';
import { AuthTokenFactoryInterface } from '../../auth-token/factory/auth-token-factory.interface';
import { SessionClient } from 'metascape-session-client';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
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
    @Inject(RefreshTokenInterface)
    private readonly refreshTokenService: RefreshTokenInterface,
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
    @Inject(RefreshTokenFactoryInterface)
    private readonly refreshTokenFactoryService: RefreshTokenFactoryInterface,
    @Inject(AuthTokenFactoryInterface)
    private readonly authTokenFactoryService: AuthTokenFactoryInterface,
    @Inject(SessionClient)
    private readonly sessionRedisClient: SessionClient,
  ) {}

  async execute(
    request: RefreshRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    let refreshTokenDto;
    try {
      refreshTokenDto = this.refreshTokenService.verify(request.refreshToken);
    } catch (e) {
      throw new BadRequestException('Refresh token is expiried');
    }

    const oldToken = await this.tokenRepository.getOneById(
      refreshTokenDto.tokenId,
      true,
    );

    if (oldToken.session!.isClosed) {
      throw new SessionIsClosedException(
        `Session ${oldToken.session!.id} is closed`,
      );
    }
    if (oldToken.isClosed) {
      oldToken.session!.isClosed = true;
      await this.sessionRedisClient.closeSession(oldToken.sessionId);
      await this.sessionRepository.save(oldToken.session!);
      throw new TokenIsClosedException(
        `Token ${refreshTokenDto.tokenId} is closed`,
      );
    }
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({
        id: oldToken.session!.userId,
      }),
    );
    oldToken.isClosed = true;
    await this.tokenRepository.save(oldToken);
    const token = this.tokenFactory.createToken(oldToken.sessionId);
    await this.sessionRedisClient.setSession(oldToken.sessionId, token.id);

    await this.tokenRepository.save(token);
    const authPayload = this.authTokenFactoryService.createPayload(
      userData.data!,
      oldToken.sessionId,
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
