import { Inject, Injectable } from '@nestjs/common';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { CloseSessionRequest } from '../requests/close-session.request';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { SessionIsClosedException } from '../exceptions/session-is-closed.exception';
import { SessionClient } from 'metascape-session-client';

@Injectable()
export class CloseSessionUseCase {
  constructor(
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
    @Inject(SessionClient)
    private readonly sessionRedisClient: SessionClient,
  ) {}

  async execute(request: CloseSessionRequest): Promise<void> {
    const session = await this.sessionRepository.getOneById(
      request.sessionId,
      true,
    );
    if (session.isClosed) {
      throw new SessionIsClosedException(
        `session ${session.id} is olready closed`,
      );
    }
    session.isClosed = true;
    await this.sessionRepository.save(session);
  }
}
