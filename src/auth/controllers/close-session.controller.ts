import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api';
import { AUTH_SERVICE_NAME, CloseSessionResponse} from '../auth.pb';
import { CloseSessionUseCase } from '../use-case/close-session.use-case';
import { CloseSessionRequest } from '../requests/close-session.request';

@Controller()
export class CloseSessionController {
  constructor(private readonly useCase: CloseSessionUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'CloseSession')
  execute(
    request: CloseSessionRequest,
  ): Promise<SuccessResponse<CloseSessionResponse>> {
    return this.useCase.execute(request);
  }
}
