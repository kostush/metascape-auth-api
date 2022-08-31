import { IsEmail, IsString, IsUUID, Length } from 'class-validator';
import { LoginByEmailRequest as ILoginByEmailRequest } from '../auth.pb';

export class LoginByEmailRequest implements ILoginByEmailRequest {
  @IsUUID(4)
  readonly businessId: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(4)
  readonly password: string;

  constructor(businessId: string, email: string, password: string) {
    this.businessId = businessId;
    this.email = email;
    this.password = password;
  }
}
