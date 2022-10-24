import { UserResponseData } from 'metascape-user-api-client';
import { JwtPayloadDataDto } from 'metascape-common-api/dist/common/dtos/jwt-payload.dto';

export interface JwtPayloadFactoryInterface {
  createJwtPayload(user: UserResponseData): JwtPayloadDataDto;
}

export const JwtPayloadFactoryInterface = Symbol('JwtPayloadFactoryInterface');
