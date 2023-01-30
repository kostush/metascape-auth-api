import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenFactoryInterface } from './refresh-token-factory.interface';
import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

@Injectable()
export class RefreshTokenFactoryService
  implements RefreshTokenFactoryInterface
{
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload: RefreshTokenPayloadDataDto): string {
    return this.jwtService.sign(payload);
  }

  createPayload(tokenId: string): RefreshTokenPayloadDataDto {
    return {
      tokenId: tokenId,
    };
  }
}
