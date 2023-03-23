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
  async findAllNotClosedByUserId(
    userId: string,
    withRelation = false,
  ): Promise<SessionModel[]> {
    return this.sessionRepository.find({
      relations: { tokens: withRelation },
      where: {
        userId: userId,
        isClosed: false,
      },
    });
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

  private prepareForSave(session: SessionModel): void {
    if (!session.createdAt) {
      session.createdAt = this.dateTime.getCurrentUnixTimestamp();
    }
    session.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    session.tokens?.forEach((token) => {
      if (!token.createdAt) {
        token.createdAt = this.dateTime.getCurrentUnixTimestamp();
      }
      token.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    });
  }
  async save(session: SessionModel): Promise<void> {
    this.prepareForSave(session);
    await this.sessionRepository.save(session);
  }

  async saveAll(sessions: SessionModel[]): Promise<void> {
    for (const session of sessions) {
      this.prepareForSave(session);
    }
    await this.sessionRepository.save(sessions);
  }

  async delete(session: SessionModel): Promise<void> {
    await this.sessionRepository.delete(session.id);
  }
}
