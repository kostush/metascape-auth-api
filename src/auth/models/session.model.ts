import { TokenModel } from './token.model';

export class SessionModel {
  id: string;
  userId: string;
  isClosed: boolean;
  tokens: TokenModel[];
  createdAt: number | null;
  updatedAt: number | null;

  constructor(
    id: string,
    userId: string,
    isClosed: boolean,
    tokens: TokenModel[],
    createdAt: number | null,
    updatedAt: number | null,
  ) {
    this.id = id;
    this.userId = userId;
    this.isClosed = isClosed;
    this.tokens = tokens;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
