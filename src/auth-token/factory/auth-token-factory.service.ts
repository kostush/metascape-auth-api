import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenFactoryInterface } from './auth-token-factory.interface';
import { JwtPayloadDataDto } from 'metascape-common-api';
import { UserResponseData } from 'metascape-user-api-client';

@Injectable()
export class AuthTokenFactoryService implements AuthTokenFactoryInterface {
  constructor(private readonly jwtService: JwtService) {}
  createToken(payload: JwtPayloadDataDto): string {
    return this.jwtService.sign(payload);
  }
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
