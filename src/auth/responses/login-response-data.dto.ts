import { LoginResponseData } from '../auth.pb';

export class LoginResponseDataDto implements LoginResponseData {
  readonly authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }
}
