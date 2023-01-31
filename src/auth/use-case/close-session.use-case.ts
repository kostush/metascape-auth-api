import {ConflictException, Inject, Injectable} from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
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
import {CloseSessionRequest} from "../requests/close-session.request";
import {CloseSessionResponse} from "../auth.pb";

@Injectable()
export class CloseSessionUseCase {
  constructor(
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
  ) {}

  async execute(
    request: CloseSessionRequest,
  ): Promise<SuccessResponse<CloseSessionResponse>> {
    const session = await this.sessionRepository.getOneById(request.sessionId);
    if (session.isClosed) {
      throw new ConflictException('session is olready closed');
    }
    session.isClosed = true;
    session.tokens?.map((token) => {
      token.isClosed = true;
      return token;
    });
    await this.sessionRepository.update(session);

    return new SuccessResponse<CloseSessionResponse>();
  }
}
