import { ValidateRequest as IValidateRequest } from '../auth.pb';
import { IsAuthToken } from 'metascape-common-api';

export class ValidateRequest implements IValidateRequest {
  @IsAuthToken()
  readonly authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }
}
