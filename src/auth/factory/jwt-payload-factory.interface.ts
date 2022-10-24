import { UserResponseData } from 'metascape-user-api-client';
import { JwtPayloadDataDto } from '../responses/jwt-payload-data.dto';

export interface JwtPayloadFactoryInterface {
  createJwtPayload(user: UserResponseData): JwtPayloadDataDto;
}

export const JwtPayloadFactoryInterface = Symbol('JwtPayloadFactoryInterface');
