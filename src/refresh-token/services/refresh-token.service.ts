import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenInterface } from './refresh-token.interface';
import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

@Injectable()
export class RefreshTokenService implements RefreshTokenInterface {
  constructor(private readonly jwtService: JwtService) {}

  verify(refreshToken: string): RefreshTokenPayloadDataDto {
    return this.jwtService.verify(refreshToken);
  }

  sign(payload: RefreshTokenPayloadDataDto): string {
    return this.jwtService.sign(payload);
  }
}
