import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api/dist';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client/dist';
import { lastValueFrom } from 'rxjs';
import { LoginByWalletRequest } from '../requests/login-by-wallet.request';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    // @Inject(WALLETS_SERVICE_NAME) private readonly walletsServiceClient: WalletsServiceClient
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    request: LoginByWalletRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    // const walletData = await lastValueFrom(
    //   this.walletsServiceClient.signNonce(
    //     { businessId: request.businessId, address: request.address, signature: request.signature }
    //   )
    // )
    // check signature for walletData.data.nonce
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({ id: 'walletData.data.userId' }),
    );
    const token = this.jwtService.sign(userData);
    return new SuccessResponse(new LoginResponseDataDto(token));
  }
}
