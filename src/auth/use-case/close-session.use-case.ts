import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { SessionRepositoryInterface } from '../repositories/session-repository.interface';
import { CloseSessionRequest } from '../requests/close-session.request';
import { TokenRepositoryInterface } from '../repositories/token-repository.interface';

@Injectable()
export class CloseSessionUseCase {
  constructor(
    @Inject(SessionRepositoryInterface)
    private readonly sessionRepository: SessionRepositoryInterface,
    @Inject(TokenRepositoryInterface)
    private readonly tokenRepository: TokenRepositoryInterface,
  ) {}

  async execute(request: CloseSessionRequest): Promise<void> {
    const session = await this.sessionRepository.getOneById(
      request.sessionId,
      true,
    );
    if (session.isClosed) {
      throw new ConflictException(`session ${session.id} is olready closed`);
    }
    session.isClosed = true;
    session.tokens?.map((token) => {
      token.isClosed = true;
      return token;
    });
    await this.sessionRepository.update(session);
  }
}
