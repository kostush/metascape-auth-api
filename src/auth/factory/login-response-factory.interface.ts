import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { UserResponse } from 'metascape-user-api-client';

export interface LoginResponseFactoryInterface {
  createLoginResponse(
    userData: UserResponse,
    sessionId: string,
    tokenId: string,
  ): SuccessResponse<LoginResponseDataDto>;
}

export const LoginResponseFactoryInterface = Symbol(
  'LoginResponseFactoryInterface',
);
