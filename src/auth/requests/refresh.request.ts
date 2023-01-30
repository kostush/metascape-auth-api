import { RefreshRequest as IRefreshRequest } from '../auth.pb';
import { IsRefreshToken } from 'metascape-common-api';

export class RefreshRequest implements IRefreshRequest {
  @IsRefreshToken()
  readonly refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}
