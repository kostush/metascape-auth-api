import { TokenModel } from '../models/token.model';

export interface TokenRepositoryInterface {
  findOneById(id: string, withRelation?: boolean): Promise<TokenModel | null>;

  getOneById(id: string, withRelation?: boolean): Promise<TokenModel>;

  findOneBySessionId(tokenId: string): Promise<TokenModel | null>;

  getOneBySessionId(tokenId: string): Promise<TokenModel>;

  getOneNotClosedById(id: string, withRelation?: boolean): Promise<TokenModel>;

  insert(session: TokenModel): Promise<void>;

  update(session: TokenModel): Promise<void>;

  delete(session: TokenModel): Promise<void>;
}

export const TokenRepositoryInterface = Symbol('TokenRepositoryInterface');
