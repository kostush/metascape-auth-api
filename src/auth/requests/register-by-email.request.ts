import { RegisterByEmailRequest as IRegisterByEmailRequest } from '../auth.pb';
import {
  IsBusinessId,
  IsUserEmail,
  IsUserPassword,
} from 'metascape-common-api';

export class RegisterByEmailRequest implements IRegisterByEmailRequest {
  @IsBusinessId()
  readonly businessId: string;

  @IsUserEmail()
  readonly email: string;

  @IsUserPassword()
  readonly password: string;

  constructor(businessId: string, email: string, password: string) {
    this.businessId = businessId;
    this.email = email;
    this.password = password;
  }
}
