import { RefreshTokenPayloadDataDto } from '../dtos/refresh-token-payload-data.dto';

export interface RefreshTokenInterface {
  verify(refreshToken: string): RefreshTokenPayloadDataDto;
  sign(payload: RefreshTokenPayloadDataDto): string;
}

export const RefreshTokenInterface = Symbol('RefreshToken');
