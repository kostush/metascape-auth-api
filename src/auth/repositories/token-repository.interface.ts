import { TokenModel } from '../models/token.model';

export interface TokenRepositoryInterface {
  findOneById(id: string, withRelation?: boolean): Promise<TokenModel | null>;

  getOneById(id: string, withRelation?: boolean): Promise<TokenModel>;

  save(token: TokenModel): Promise<void>;

  delete(token: TokenModel): Promise<void>;
}

export const TokenRepositoryInterface = Symbol('TokenRepositoryInterface');
