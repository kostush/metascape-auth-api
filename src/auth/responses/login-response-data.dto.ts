import { LoginResponseData } from '../auth.pb';

export class LoginResponseDataDto implements LoginResponseData {
  readonly authToken: string;
  readonly refreshToken: string;

  constructor(authToken: string, refreshToken: string) {
    this.authToken = authToken;
    this.refreshToken = refreshToken;
  }
}
