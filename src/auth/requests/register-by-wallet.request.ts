import { IsEthereumAddress, IsUUID } from 'class-validator';
import { RegisterByWalletRequest as IRegisterByWalletRequest } from '../auth.pb';

export class RegisterByWalletRequest implements IRegisterByWalletRequest {
  @IsUUID(4)
  readonly businessId: string;

  @IsEthereumAddress()
  readonly address: string;

  constructor(businessId: string, address: string) {
    this.businessId = businessId;
    this.address = address;
  }
}
