import { CloseAllUserSessionsRequest as ICloseAllUserSessionsRequest } from '../auth.pb';
import { IsUserId } from 'metascape-common-api';

export class CloseAllUserSessionsRequest
  implements ICloseAllUserSessionsRequest
{
  @IsUserId()
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
