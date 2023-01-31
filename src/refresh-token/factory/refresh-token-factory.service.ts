import { Injectable } from '@nestjs/common';
import { RefreshTokenFactoryInterface } from './refresh-token-factory.interface';
import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

@Injectable()
export class RefreshTokenFactoryService
  implements RefreshTokenFactoryInterface
{
  createPayload(tokenId: string): RefreshTokenPayloadDataDto {
    return {
      tokenId: tokenId,
    };
  }
}
