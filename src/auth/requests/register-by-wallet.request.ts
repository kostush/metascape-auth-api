import { IsEthereumAddress } from 'class-validator';
import { RegisterByWalletRequest as IRegisterByWalletRequest } from '../auth.pb';
import { IsBusinessId } from 'metascape-common-api';

export class RegisterByWalletRequest implements IRegisterByWalletRequest {
  @IsBusinessId()
  readonly businessId: string;

  @IsEthereumAddress()
  readonly address: string;

  constructor(businessId: string, address: string) {
    this.businessId = businessId;
    this.address = address;
  }
}
