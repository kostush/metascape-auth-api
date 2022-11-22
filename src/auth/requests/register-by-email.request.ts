import { IsEmail, IsUUID } from 'class-validator';
import { RegisterByEmailRequest as IRegisterByEmailRequest } from '../auth.pb';
import { IsUserPassword } from 'metascape-common-api';

export class RegisterByEmailRequest implements IRegisterByEmailRequest {
  @IsUUID(4)
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
