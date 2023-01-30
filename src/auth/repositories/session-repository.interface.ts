import { SessionModel } from '../models/session.model';

export interface SessionRepositoryInterface {
  findAll(): Promise<SessionModel[]>;

  findOneById(id: string, withRelation?: boolean): Promise<SessionModel | null>;

  getOneById(id: string, withRelation?: boolean): Promise<SessionModel>;

  findOneByTokenId(tokenId: string): Promise<SessionModel | null>;

  getOneByTokenId(tokenId: string): Promise<SessionModel>;

  insert(session: SessionModel): Promise<void>;

  update(session: SessionModel): Promise<void>;

  delete(session: SessionModel): Promise<void>;
}

export const SessionRepositoryInterface = Symbol('SessionRepositoryInterface');
