import { IsEthereumAddress } from 'class-validator';
import { LoginByWalletRequest as ILoginByWalletRequest } from '../auth.pb';
import { IsBusinessId, IsWalletSignature } from 'metascape-common-api';

export class LoginByWalletRequest implements ILoginByWalletRequest {
  @IsBusinessId()
  readonly businessId: string;

  @IsEthereumAddress()
  readonly address: string;

  @IsWalletSignature()
  readonly signature: string;

  constructor(businessId: string, address: string, signature: string) {
    this.businessId = businessId;
    this.address = address;
    this.signature = signature;
  }
}
