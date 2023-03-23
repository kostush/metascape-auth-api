import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { CloseAllUserSessionsUseCase } from '../use-case/close-all-user-sessions.use-case';
import { CloseAllUserSessionsRequest } from '../requests/close-all-user-sessions.request';

@Controller()
export class CloseAllUserSessionsController {
  constructor(private readonly useCase: CloseAllUserSessionsUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'CloseAllUserSessions')
  execute(request: CloseAllUserSessionsRequest): Promise<void> {
    return this.useCase.execute(request);
  }
}
