import { RegisterByWalletResponseData } from '../auth.pb';

export class RegisterByWalletResponseDataDto
  implements RegisterByWalletResponseData
{
  businessId: string;
  id: string;
  address: string;
  nonce: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string | undefined;
  updatedBy: string | undefined;

  constructor(
    businessId: string,
    id: string,
    address: string,
    nonce: string,
    userId: string,
    createdAt: number,
    updatedAt: number,
    createdBy: string | undefined,
    updatedBy: string | undefined,
  ) {
    this.businessId = businessId;
    this.id = id;
    this.address = address;
    this.nonce = nonce;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }
}
