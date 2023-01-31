import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

export interface RefreshTokenFactoryInterface {
  createPayload(tokenId: string): RefreshTokenPayloadDataDto;
}

export const RefreshTokenFactoryInterface = Symbol('RefreshTokenFactory');
