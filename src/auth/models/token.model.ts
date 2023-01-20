import { SessionModel } from './session.model';

export class TokenModel {
  id: string;
  sessionId?: string;
  isClosed?: boolean;
  createdAt?: number | null;
  updatedAt?: number | null;
  session?: SessionModel;

  constructor(
    id: string,
    sessionId?: string,
    isClosed?: boolean,
    createdAt?: number,
    updatedAt?: number,
    session?: SessionModel,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.isClosed = isClosed;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.session = session;
  }
}
