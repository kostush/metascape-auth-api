import { Injectable } from '@nestjs/common';
import { SessionFactoryInterface } from './session-factory.interface';
import { SessionModel } from '../models/session.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionFactory implements SessionFactoryInterface {
  createSession(userId: string): SessionModel {
    return new SessionModel(uuidv4(), userId, false, null, null);
  }
}
