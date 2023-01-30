import { UserResponseData } from 'metascape-user-api-client';

export interface AuthTokenFactoryInterface {
  createToken(
    user: UserResponseData,
    sessionId: string,
    tokenId: string,
  ): string;
}

export const AuthTokenFactoryInterface = Symbol('AuthTokenFactory');
