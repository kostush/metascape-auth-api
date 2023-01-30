import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

export interface RefreshTokenFactoryInterface {
  createPayload(tokenId: string): RefreshTokenPayloadDataDto;
  createToken(payload: RefreshTokenPayloadDataDto): string;
}

export const RefreshTokenFactoryInterface = Symbol('RefreshTokenFactory');
