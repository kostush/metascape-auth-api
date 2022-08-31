import { IsString } from 'class-validator';
import { ValidateRequest as IValidateRequest } from '../auth.pb';

export class ValidateRequest implements IValidateRequest {
  @IsString()
  readonly authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }
}
