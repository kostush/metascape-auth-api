import { CloseSessionRequest as ICloseSessionRequest } from '../auth.pb';
import { IsString } from 'class-validator';

export class CloseSessionRequest implements ICloseSessionRequest {
  @IsString()
  readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
}
