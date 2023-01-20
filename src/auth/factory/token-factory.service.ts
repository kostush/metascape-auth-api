import { TokenFactoryInterface } from './token-factory.interface';
import { Injectable } from '@nestjs/common';
import { TokenModel } from '../models/token.model';

@Injectable()
export class TokenFactory implements TokenFactoryInterface {
  createToken(tokenId: string, sessionId: string): TokenModel {
    return new TokenModel(tokenId, sessionId, false);
  }
}
