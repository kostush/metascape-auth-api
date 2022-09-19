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
}
