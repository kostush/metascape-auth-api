import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { LoginByEmailRequest } from '../requests/login-by-email.request';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { JwtPayloadFactoryInterface } from '../factory/jwt-payload-factory.interface';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { SessionFactoryInterface } from '../factory/session-factory.interface';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';
import PARAMETERS from '../../params/params.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginByEmailUseCase {
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
    private readonly configService: ConfigService,
  ) {}

  async execute(
    request: LoginByEmailRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserByEmailAndPassword({
        businessId: request.businessId,
        email: request.email,
        password: request.password,
      }),
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
    const authJwt = this.jwtService.sign(payload, {
      privateKey: this.configService.get(PARAMETERS.JWT_AUTH_PRIVATE_KEY),
      expiresIn: this.configService.get(PARAMETERS.JWT_AUTH_EXPIRES_IN),
    });
    const refreshJwt = this.jwtService.sign(payload, {
      privateKey: this.configService.get(PARAMETERS.JWT_REFRESH_PRIVATE_KEY),
      expiresIn: this.configService.get(PARAMETERS.JWT_REFRESH_EXPIRES_IN),
    });
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  }
}
