import { Injectable } from '@nestjs/common';
import { AuthTokenFactoryInterface } from './auth-token-factory.interface';
import { JwtPayloadDataDto } from 'metascape-common-api';
import { UserResponseData } from 'metascape-user-api-client';

@Injectable()
export class AuthTokenFactoryService implements AuthTokenFactoryInterface {
  createPayload(
    user: UserResponseData,
    sessionId: string,
    tokenId: string,
  ): JwtPayloadDataDto {
    return {
      businessId: user.businessId,
      id: user.id,
      sessionId: sessionId,
      tokenId: tokenId,
    };
  }
}
