import { SessionModel } from '../models/session.model';

export interface SessionRepositoryInterface {
  findAll(): Promise<SessionModel[]>;
  findAllNotClosedByUserId(
    userId: string,
    withRelations?: boolean,
  ): Promise<SessionModel[]>;

  findOneById(id: string, withRelation?: boolean): Promise<SessionModel | null>;

  getOneById(id: string, withRelation?: boolean): Promise<SessionModel>;

  findOneByTokenId(tokenId: string): Promise<SessionModel | null>;

  getOneByTokenId(tokenId: string): Promise<SessionModel>;

  save(session: SessionModel): Promise<void>;

  saveAll(sessions: SessionModel[]): Promise<void>;

  delete(session: SessionModel): Promise<void>;
}

export const SessionRepositoryInterface = Symbol('SessionRepositoryInterface');
