import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client';
import { lastValueFrom } from 'rxjs';
import { LoginByWalletRequest } from '../requests/login-by-wallet.request';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { JwtService } from '@nestjs/jwt';
import {
  WALLETS_SERVICE_NAME,
  WalletsServiceClient,
} from 'metascape-wallet-api-client';
import { JwtPayloadFactoryInterface } from '../factory/jwt-payload-factory.interface';

@Injectable()
export class LoginByWalletUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    @Inject(WALLETS_SERVICE_NAME)
    private readonly walletsServiceClient: WalletsServiceClient,
    @Inject(JwtPayloadFactoryInterface)
    private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    request: LoginByWalletRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    const walletData = await lastValueFrom(
      this.walletsServiceClient.signNonce({
        businessId: request.businessId,
        address: request.address,
        signature: request.signature,
      }),
    );

    const userData = await lastValueFrom(
      this.usersServiceClient.getUserById({ id: walletData.data!.id }),
    );
    // const walletsData = await this.walletsServiceClient.getWalletsByUserId(userData.data!.id);
    const payload = this.jwtPayloadFactory.createJwtPayload(userData.data!, [
      walletData.data!,
    ]);
    const token = this.jwtService.sign(payload);

    return new SuccessResponse(new LoginResponseDataDto(token));
  }
}