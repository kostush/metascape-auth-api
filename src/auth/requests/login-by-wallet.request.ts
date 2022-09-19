import { IsEthereumAddress, IsString, IsUUID } from 'class-validator';
import { LoginByWalletRequest as ILoginByWalletRequest } from '../auth.pb';

export class LoginByWalletRequest implements ILoginByWalletRequest {
  @IsUUID(4)
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
