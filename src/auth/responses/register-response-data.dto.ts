import { RegisterResponseData } from '../auth.pb';

export class RegisterResponseDataDto implements RegisterResponseData {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
