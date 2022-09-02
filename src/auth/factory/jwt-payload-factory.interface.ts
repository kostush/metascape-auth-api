import { UserResponseData } from 'metascape-user-api-client';
import { WalletResponseData } from 'metascape-wallet-api-client';
import { JwtPayloadDataDto } from '../responses/jwt-payload-data.dto';

export interface JwtPayloadFactoryInterface {
  createJwtPayload(
    user: UserResponseData,
    wallets: WalletResponseData[],
  ): JwtPayloadDataDto;
}

export const JwtPayloadFactoryInterface = Symbol('JwtPayloadFactoryInterface');
