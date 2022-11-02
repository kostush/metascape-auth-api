import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { lastValueFrom } from 'rxjs';
import { RegisterByWalletRequest } from '../requests/register-by-wallet.request';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { RegisterByWalletResponseDataDto } from '../responses/register-by-wallet-response-data.dto';
import { WalletResponseFactoryInterface } from '../factory/wallet-response-factory.interface';

@Injectable()
export class RegisterByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
    @Inject(WalletResponseFactoryInterface)
    private readonly walletResponseFactory: WalletResponseFactoryInterface,
  ) {}

  async execute(
    request: RegisterByWalletRequest,
  ): Promise<SuccessResponse<RegisterByWalletResponseDataDto>> {
    const userData = await lastValueFrom(
      this.usersServiceClient.createUser({ businessId: request.businessId }),
    );
    const walletData = await lastValueFrom(
      this.walletsServiceClient.createWallet({
        businessId: request.businessId,
        address: request.address,
        userId: userData.data!.id,
      }),
    );

    return this.walletResponseFactory.createWalletResponse(walletData.data!);
  }
}
