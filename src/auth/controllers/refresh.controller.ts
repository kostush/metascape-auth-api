import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { RefreshUseCase } from '../use-case/refresh.use-case';
import { RefreshRequest } from '../requests/refresh.request';

@Controller()
export class RefreshController {
  constructor(private readonly useCase: RefreshUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Refresh')
  execute(
    request: RefreshRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
