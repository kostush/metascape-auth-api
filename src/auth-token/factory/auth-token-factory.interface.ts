import { JwtPayloadDataDto } from 'metascape-common-api';
import { UserResponseData } from 'metascape-user-api-client';

export interface AuthTokenFactoryInterface {
  createToken(payload: JwtPayloadDataDto): string;
  createPayload(
    user: UserResponseData,
    sessionId: string,
    tokenId: string,
  ): JwtPayloadDataDto;
}

export const AuthTokenFactoryInterface = Symbol('AuthTokenFactory');
