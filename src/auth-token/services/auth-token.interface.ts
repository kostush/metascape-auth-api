import { JwtPayloadDataDto } from "metascape-common-api";

export interface AuthTokenInterface {
  verify(authToken: string): JwtPayloadDataDto;
}

export const AuthTokenInterface = Symbol('AuthToken');
