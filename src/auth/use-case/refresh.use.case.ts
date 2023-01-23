import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RefreshRequest } from '../requests/refresh.request';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { RefreshTokenFactoryInterface } from '../../refresh-token/factory/refresh-token-factory.interface';
import { RefreshTokenService } from '../../refresh-token/services/refresh-token.service';
import { RefreshTokenPayloadDataDto } from '../../refresh-token/dtos/refresh-token-payload-data.dto';
import { AuthTokenFactoryInterface } from '../../auth-token/factory/auth-token-factory.interface';
import { AuthTokenService } from '../../auth-token/services/auth-token.service';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { lastValueFrom } from 'rxjs';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';

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
    @Inject(RefreshTokenFactoryInterface)
    private readonly refreshTokenFactory: RefreshTokenFactoryInterface,
    @Inject(RefreshTokenService)
    private readonly refreshTokenService: RefreshTokenService,
    @Inject(AuthTokenFactoryInterface)
    private readonly authTokenFactory: AuthTokenFactoryInterface,
    @Inject(AuthTokenService)
    private readonly authTokenService: AuthTokenService,
  ) {}
  async execute(
    request: RefreshRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    let refreshTokenPayload: RefreshTokenPayloadDataDto;
    try {
      refreshTokenPayload = this.refreshTokenService.verify(
        request.refreshToken,
      );
    } catch (e) {
      throw new BadRequestException('Refresh token is not valid or expired');
    }

    const token = await this.tokenRepository.getOneNotClosedById(
      refreshTokenPayload.tokenId,
      true,
    );

    token.isClosed = true;
    await this.tokenRepository.update(token);
    const session = token.session!;
    const newToken = this.tokenFactory.createToken(session.id);

    session.tokens!.push(newToken);
    await this.sessionRepository.update(session);
    // const session = await this.sessionRepository.getOneNotClosedByTokenId(
    //   refreshTokenPayload.tokenId,
    // );

    // if (session.isClosed || token.isClosed) {
    //   throw new BadRequestException('Token is closed or not exist');
    // }
    // session.tokens!.map((token) => {
    //   token.isClosed = true;
    //   return token;
    // });

    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({
        id: session.userId,
      }),
    );

    const authJwt = this.authTokenFactory.createToken(
      userData.data!,
      session.id,
      newToken.id,
    );
    const refreshJwt = this.refreshTokenFactory.createToken(newToken.id);
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  }
}
