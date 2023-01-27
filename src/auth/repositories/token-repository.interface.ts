import { TokenModel } from '../models/token.model';

export interface TokenRepositoryInterface {
  findOneById(id: string, withRelation?: boolean): Promise<TokenModel | null>;

  getOneById(id: string, withRelation?: boolean): Promise<TokenModel>;

  insert(token: TokenModel): Promise<void>;

  update(token: TokenModel): Promise<void>;

  delete(token: TokenModel): Promise<void>;
}

export const TokenRepositoryInterface = Symbol('TokenRepositoryInterface');
