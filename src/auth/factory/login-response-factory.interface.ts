import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { UserResponse } from 'metascape-user-api-client';
import { SessionModel } from '../models/session.model';
import { TokenModel } from '../models/token.model';

export interface LoginResponseFactoryInterface {
  createLoginResponse(
    userData: UserResponse,
    session: SessionModel,
    tokenId: TokenModel,
  ): SuccessResponse<LoginResponseDataDto>;
}

export const LoginResponseFactoryInterface = Symbol(
  'LoginResponseFactoryInterface',
);
