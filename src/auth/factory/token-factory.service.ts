import { TokenFactoryInterface } from './token-factory.interface';
import { Injectable } from '@nestjs/common';
import { TokenModel } from '../models/token.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenFactory implements TokenFactoryInterface {
  createToken(sessionId: string): TokenModel {
    return new TokenModel(uuidv4(), sessionId, false, null, null);
  }
}
