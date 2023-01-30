import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTimeInterface } from 'metascape-common-api';
import { TokenModel } from '../models/token.model';
import { TokenRepositoryInterface } from './token-repository.interface';
import { TokenNotFoundException } from '../exceptions/token-not-found.exception';

@Injectable()
export class TokenRepository implements TokenRepositoryInterface {
  constructor(
    @InjectRepository(TokenModel)
    private readonly tokenRepository: Repository<TokenModel>,
    @Inject(DateTimeInterface) private readonly dateTime: DateTimeInterface,
  ) {}

  async findOneById(
    id: string,
    withRelation = false,
  ): Promise<TokenModel | null> {
    return this.tokenRepository.findOne({
      relations: { session: withRelation },
      where: { id },
    });
  }

  async getOneById(id: string, withRelation = false): Promise<TokenModel> {
    const token = await this.findOneById(id, withRelation);
    if (!token) {
      throw new TokenNotFoundException(`token is not found by id "${id}"`);
    }
    return token;
  }

  async insert(token: TokenModel): Promise<void> {
    token.createdAt = this.dateTime.getCurrentUnixTimestamp();
    token.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    await this.tokenRepository.insert(token);
  }

  async update(token: TokenModel): Promise<void> {
    token.updatedAt = this.dateTime.getCurrentUnixTimestamp();
    await this.tokenRepository.save(token);
  }

  async delete(token: TokenModel): Promise<void> {
    await this.tokenRepository.delete(token.id);
  }
}
