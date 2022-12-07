import { IsEmail } from 'class-validator';
import { LoginByEmailRequest as ILoginByEmailRequest } from '../auth.pb';
import { IsBusinessId, IsUserPassword } from 'metascape-common-api';

export class LoginByEmailRequest implements ILoginByEmailRequest {
  @IsBusinessId()
  readonly businessId: string;

  @IsEmail()
  readonly email: string;

  @IsUserPassword()
  readonly password: string;

  constructor(businessId: string, email: string, password: string) {
    this.businessId = businessId;
    this.email = email;
    this.password = password;
  }
}
