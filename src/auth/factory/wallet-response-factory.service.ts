import { Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { WalletResponseFactoryInterface } from './wallet-response-factory.interface';
import { WalletResponseData } from 'metascape-wallet-api-client';
import { RegisterByWalletResponseDataDto } from '../responses/register-by-wallet-response-data.dto';

@Injectable()
export class WalletResponseFactory implements WalletResponseFactoryInterface {
  createWalletResponse(
    walletModel: WalletResponseData,
  ): SuccessResponse<RegisterByWalletResponseDataDto> {
    return new SuccessResponse(
      new RegisterByWalletResponseDataDto(
        walletModel.businessId,
        walletModel.id,
        walletModel.address,
        walletModel.nonce,
        walletModel.userId as string,
        walletModel.createdAt,
        walletModel.updatedAt,
        walletModel.createdBy,
        walletModel.updatedBy,
      ),
    );
  }
}
