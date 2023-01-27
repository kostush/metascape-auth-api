import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseFactoryInterface } from './login-response-factory.interface';
import { UserResponse } from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { JwtPayloadFactoryInterface } from './jwt-payload-factory.interface';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../refresh-token/services/refresh-token.interface';
import { SessionModel } from '../models/session.model';
import { TokenModel } from '../models/token.model';

@Injectable()
export class LoginResponseFactoryService
  implements LoginResponseFactoryInterface
{
  constructor(
    @Inject(JwtPayloadFactoryInterface)
    private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
    @Inject(RefreshTokenInterface)
    private readonly refreshTokenService: RefreshTokenInterface,
  ) {}
  createLoginResponse = (
    userData: UserResponse,
    session: SessionModel,
    token: TokenModel,
  ): SuccessResponse<LoginResponseDataDto> => {
    const payload = this.jwtPayloadFactory.createJwtPayload(
      userData.data!,
      session.id,
      token.id,
    );
    const authJwt = this.authTokenService.sign(payload);
    const refreshJwt = this.refreshTokenService.sign({
      tokenId: payload.tokenId,
    });
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  };
}
