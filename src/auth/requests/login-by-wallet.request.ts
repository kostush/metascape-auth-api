import { IsEthereumAddress, IsString } from 'class-validator';
import { LoginByWalletRequest as ILoginByWalletRequest } from '../auth.pb';
import { IsBusinessId } from 'metascape-common-api';

export class LoginByWalletRequest implements ILoginByWalletRequest {
  @IsBusinessId()
  readonly businessId: string;

  @IsEthereumAddress()
  readonly address: string;

  @IsString()
  readonly signature: string;

  constructor(businessId: string, address: string, signature: string) {
    this.businessId = businessId;
    this.address = address;
    this.signature = signature;
  }
}
