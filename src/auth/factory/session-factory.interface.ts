import { SessionModel } from '../models/session.model';
import { TokenModel } from '../models/token.model';

export interface SessionFactoryInterface {
  createSession(
    sessionId: string,
    userId: string,
    token: TokenModel,
  ): SessionModel;
}

export const SessionFactoryInterface = Symbol('SessionFactoryInterface');
