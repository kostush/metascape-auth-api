import { SuccessResponse } from 'metascape-common-api';
import { RegisterByWalletResponseDataDto } from '../responses/register-by-wallet-response-data.dto';
import { WalletResponseData } from 'metascape-wallet-api-client';

export interface WalletResponseFactoryInterface {
  createWalletResponse(
    walletModel: WalletResponseData,
  ): SuccessResponse<RegisterByWalletResponseDataDto>;
}

export const WalletResponseFactoryInterface = Symbol(
  'WalletResponseFactoryInterface',
);
