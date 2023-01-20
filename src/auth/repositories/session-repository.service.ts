import { SessionRepositoryInterface } from './session-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTimeInterface } from 'metascape-common-api';
import { SessionNotFoundException } from '../exceptions/session-not-found.exception';
import { SessionModel } from '../models/session.model';

@Injectable()
export class SessionRepository implements SessionRepositoryInterface {
  constructor(
    @InjectRepository(SessionModel)
    private readonly sessionRepository: Repository<SessionModel>,
    @Inject(DateTimeInterface) private readonly dateTime: DateTimeInterface,
  ) {}

  async findAll(): Promise<SessionModel[]> {
    return this.sessionRepository.find();
  }

  async findOneById(
    id: string,
    withRelation = false,
  ): Promise<SessionModel | null> {
    return this.sessionRepository.findOne({
      relations: { tokens: withRelation },
      where: { id },
    });
  }

  async getOneById(id: string, withRelation = false): Promise<SessionModel> {
    const session = await this.findOneById(id, withRelation);
    if (!session) {
      throw new SessionNotFoundException(`session is not found by id "${id}"`);
    }
    return session;
  }

  async findOneByTokenId(tokenId: string): Promise<SessionModel | null> {
    return this.sessionRepository.findOne({
      relations: { tokens: true },
      where: [{ tokens: { id: tokenId } }],
    });
  }

  async getOneByTokenId(tokenId: string): Promise<SessionModel> {
    const session = await this.findOneByTokenId(tokenId);
    if (!session) {
      throw new SessionNotFoundException(
        `session is not found by token id "${tokenId}"`,
      );
    }
    return session;
  }

  async insert(session: SessionModel): Promise<void> {
    session.createdAt = this.dateTime.getCurrentUnixTimestamp();
    session.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    session.tokens.forEach((tokens) => {
      tokens.createdAt = this.dateTime.getCurrentUnixTimestamp();
    });
    await this.sessionRepository.insert(session);
  }

  async update(session: SessionModel): Promise<void> {
    session.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    session.tokens.forEach((token) => {
      if (!token.createdAt) {
        token.createdAt = this.dateTime.getCurrentUnixTimestamp();
      }
    });
    await this.sessionRepository.save(session);
  }

  async delete(session: SessionModel): Promise<void> {
    await this.sessionRepository.delete(session.id);
  }
}
