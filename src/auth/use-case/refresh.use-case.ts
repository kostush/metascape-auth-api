import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { lastValueFrom } from 'rxjs';
import { JwtPayloadFactoryInterface } from '../factory/jwt-payload-factory.interface';
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
    @Inject(LoginResponseFactoryInterface)
    private readonly loginResponseFactory: LoginResponseFactoryInterface,
    @Inject(RefreshTokenInterface)
    private readonly refreshTokenService: RefreshTokenInterface,
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
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
      await this.sessionRepository.update(oldToken.session!);
      throw new TokenIsClosedException(
        `Token ${refreshTokenDto.tokenId} is closed`,
      );
    }
    oldToken.isClosed = true;

    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({
        id: oldToken.session!.userId,
      }),
    );
    const token = this.tokenFactory.createToken(oldToken.sessionId);
    await this.tokenRepository.update(oldToken);
    await this.tokenRepository.insert(token);

    const payload = this.jwtPayloadFactory.createJwtPayload(
      userData.data!,
      oldToken.sessionId,
      token.id,
    );
    const authJwt = this.authTokenService.sign(payload);
    const refreshJwt = this.refreshTokenService.sign({
      tokenId: payload.tokenId,
    });

    return this.loginResponseFactory.createLoginResponse(authJwt, refreshJwt);
  }
}
