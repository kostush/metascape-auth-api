import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';

export interface LoginResponseFactoryInterface {
  createLoginResponse(
    authToken: string,
    refreshToken: string,
  ): SuccessResponse<LoginResponseDataDto>;
}

export const LoginResponseFactoryInterface = Symbol(
  'LoginResponseFactoryInterface',
);
