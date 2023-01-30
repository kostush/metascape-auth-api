import { SessionModel } from '../models/session.model';

export interface SessionFactoryInterface {
  createSession(userId: string): SessionModel;
}

export const SessionFactoryInterface = Symbol('SessionFactoryInterface');
