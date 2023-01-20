import { Injectable } from '@nestjs/common';
import { TokenModel } from '../models/token.model';
import { SessionFactoryInterface } from './session-factory.interface';
import { SessionModel } from '../models/session.model';

@Injectable()
export class SessionFactory implements SessionFactoryInterface {
  createSession(
    sessionId: string,
    userId: string,
    token: TokenModel,
  ): SessionModel {
    return new SessionModel(sessionId, userId, false, [token]);
  }
}
