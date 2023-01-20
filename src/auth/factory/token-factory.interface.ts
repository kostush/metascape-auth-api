import { TokenModel } from '../models/token.model';

export interface TokenFactoryInterface {
  createToken(tokenId: string, sessionId: string): TokenModel;
}

export const TokenFactoryInterface = Symbol('TokenFactoryInterface');
