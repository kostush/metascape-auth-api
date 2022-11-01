import { UserResponseData } from 'metascape-user-api-client';
import { JwtPayloadDataDto } from 'metascape-common-api';

export interface JwtPayloadFactoryInterface {
  createJwtPayload(user: UserResponseData): JwtPayloadDataDto;
}

export const JwtPayloadFactoryInterface = Symbol('JwtPayloadFactoryInterface');
