import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { RegisterResponseDataDto } from '../responses/register-response-data.dto';
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

@Injectable()
export class RegisterByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
  ) {}

  async execute(
    request: RegisterByWalletRequest,
  ): Promise<SuccessResponse<RegisterResponseDataDto>> {
    const userData = await lastValueFrom(
      this.usersServiceClient.createUser({ businessId: request.businessId }),
    );
    await lastValueFrom(
      this.walletsServiceClient.createWallet({
        businessId: request.businessId,
        address: request.address,
        userId: userData.data!.id,
      }),
    );

    return new SuccessResponse(new RegisterResponseDataDto(userData.data!.id));
  }

  // connectWallet() -> getWalletByAddress(address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
  //                    createWallet(address) -> signMessage(nonce) -> registerByWallet(bussinessId, address, signature)

  // connectWallet() -> getWalletByAddress(address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
  //                    registerByWallet(bussinessId, address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
}
