import { TokenModel } from '../models/token.model';

export interface TokenFactoryInterface {
  createToken(sessionId: string): TokenModel;
}

export const TokenFactoryInterface = Symbol('TokenFactoryInterface');
