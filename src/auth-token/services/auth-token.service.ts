import { JwtPayloadDataDto } from 'metascape-common-api';
import { Injectable } from '@nestjs/common';
import { AuthTokenInterface } from './auth-token.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthTokenService implements AuthTokenInterface {
  constructor(private readonly jwtService: JwtService) {}

  verify(authToken: string): JwtPayloadDataDto {
    return this.jwtService.verify(authToken);
  }

  sign(payload: JwtPayloadDataDto): string {
    return this.jwtService.sign(payload);
  }
}
