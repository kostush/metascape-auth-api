import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api/dist';
import { RegisterResponseDataDto } from '../responses/register-response-data.dto';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client/dist';
import { lastValueFrom } from 'rxjs';
import { RegisterByWalletRequest } from '../requests/register-by-wallet.request';

@Injectable()
export class RegisterByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient, // @Inject(WALLETS_SERVICE_NAME) private readonly walletsServiceClient: WalletsServiceClient
  ) {}

  async execute(
    request: RegisterByWalletRequest,
  ): Promise<SuccessResponse<RegisterResponseDataDto>> {
    const userData = await lastValueFrom(
      this.usersServiceClient.createUser({ businessId: request.businessId }),
    );
    // const walletData = await lastValueFrom(
    //   this.walletsServiceClient.CreateWallet(
    //     { businessId: request.businessId, address: request.address, userId: userData.id }
    //   )
    // )

    return new SuccessResponse(new RegisterResponseDataDto(userData.data!.id));
  }

  // connectWallet() -> getWalletByAddress(address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
  //                    createWallet(address) -> signMessage(nonce) -> registerByWallet(bussinessId, address, signature)

  // connectWallet() -> getWalletByAddress(address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
  //                    registerByWallet(bussinessId, address) -> signMessage(nonce) -> loginByWallet(bussinessId, address, signature)
}
