import { CloseSessionRequest as ICloseSessionRequest } from '../auth.pb';
import { IsUUID } from 'class-validator';

export class CloseSessionRequest implements ICloseSessionRequest {
  @IsUUID(4)
  readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
}
