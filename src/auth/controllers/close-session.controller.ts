import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { CloseSessionUseCase } from '../use-case/close-session.use-case';
import { CloseSessionRequest } from '../requests/close-session.request';

@Controller()
export class CloseSessionController {
  constructor(private readonly useCase: CloseSessionUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'CloseSession')
  execute(request: CloseSessionRequest): Promise<void> {
    return this.useCase.execute(request);
  }
}
