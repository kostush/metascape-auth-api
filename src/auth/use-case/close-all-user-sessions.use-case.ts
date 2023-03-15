import { Inject, Injectable } from '@nestjs/common';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { CloseSessionRequest } from '../requests/close-session.request';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';
import { SessionIsClosedException } from '../exceptions/session-is-closed.exception';
import { SessionClient } from 'metascape-session-client';
import { CloseAllUserSessionsRequest } from '../requests/close-all-user-sessions.request';

@Injectable()
export class CloseAllUserSessionsUseCase {
  constructor(
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
    @Inject(SessionClient)
    private readonly sessionRedisClient: SessionClient,
  ) {}

  async execute(request: CloseAllUserSessionsRequest): Promise<void> {
    const sessions = await this.sessionRepository.findAllNotClosedByUserId(
      request.userId,
    );

    if (!sessions.length) {
      return;
    }
    await this.sessionRedisClient.closeAllSessions(
      sessions.map((session) => session.id),
    );

    for (const session of sessions) {
      session.isClosed = true;
    }
    await this.sessionRepository.saveAll(sessions);
  }
}
