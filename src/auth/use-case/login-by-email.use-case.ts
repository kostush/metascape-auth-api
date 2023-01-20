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
import { v4 as uuidv4 } from 'uuid';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { TokenFactoryInterface } from '../factory/token-factory.interface';

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

    const sessionId = uuidv4();
    const tokenId = uuidv4();
    const token = this.tokenFactory.createToken(tokenId, sessionId);
    const session = this.sessionFactory.createSession(
      sessionId,
      userData.data!.id,
      token,
    );
    await this.sessionRepository.insert(session);

    const payload = this.jwtPayloadFactory.createJwtPayload(userData.data!);
    const jwt = this.jwtService.sign(payload);
    return new SuccessResponse(new LoginResponseDataDto(jwt));
  }
}
