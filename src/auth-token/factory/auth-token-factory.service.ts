import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenFactoryInterface } from './auth-token-factory.interface';
import { UserResponseData } from 'metascape-user-api-client';
import { JwtPayloadDataDto } from 'metascape-common-api';

@Injectable()
export class AuthTokenFactoryService implements AuthTokenFactoryInterface {
  constructor(private readonly jwtService: JwtService) {}
  createToken(
    user: UserResponseData,
    sessionId: string,
    tokenId: string,
  ): string {
    const payload: JwtPayloadDataDto = {
      businessId: user.businessId,
      id: user.id,
      sessionId,
      tokenId,
    };
    return this.jwtService.sign(payload);
  }
}
