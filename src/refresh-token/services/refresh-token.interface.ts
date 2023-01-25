import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

export interface RefreshTokenInterface {
  verify(refreshToken: string): RefreshTokenPayloadDataDto;
}

export const RefreshTokenInterface = Symbol('RefreshToken');
