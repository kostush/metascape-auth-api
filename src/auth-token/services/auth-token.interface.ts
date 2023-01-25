import { JwtPayloadDataDto } from 'metascape-common-api';

export interface AuthTokenInterface {
  verify(authToken: string): JwtPayloadDataDto;
  sign(payload: JwtPayloadDataDto): string;
}

export const AuthTokenInterface = Symbol('AuthToken');
