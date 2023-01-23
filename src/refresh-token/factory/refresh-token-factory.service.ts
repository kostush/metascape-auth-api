import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenFactoryInterface } from './refresh-token-factory.interface';

@Injectable()
export class RefreshTokenFactoryService
  implements RefreshTokenFactoryInterface
{
  constructor(private readonly jwtService: JwtService) {}
  createToken(tokenId: string): string {
    const payload = {
      tokenId: tokenId,
    };
    return this.jwtService.sign(payload);
  }
}
