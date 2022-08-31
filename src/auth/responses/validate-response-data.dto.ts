import { ValidateResponseData } from '../auth.pb';

export class ValidateResponseDataDto implements ValidateResponseData {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
