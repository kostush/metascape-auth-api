import { ValidateResponseData } from '../auth.pb';

export class JwtPayloadDataDto implements ValidateResponseData {
  businessId: string;
  id: string;
  wallets: string[];
  createdAt: number;
  updatedAt: number;
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  about?: string;

  constructor(
    businessId: string,
    id: string,
    wallets: string[],
    createdAt: number,
    updatedAt: number,
    email?: string,
    nickname?: string,
    firstName?: string,
    lastName?: string,
    about?: string,
  ) {
    this.businessId = businessId;
    this.id = id;
    this.wallets = wallets;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.email = email;
    this.nickname = nickname;
    this.firstName = firstName;
    this.lastName = lastName;
    this.about = about;
  }
}
