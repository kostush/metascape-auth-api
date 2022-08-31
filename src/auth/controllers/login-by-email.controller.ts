import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api/dist';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { LoginByEmailUseCase } from '../use-case/login-by-email.use-case';
import { LoginByEmailRequest } from '../requests/login-by-email.request';

@Controller()
export class LoginByEmailController {
  constructor(private readonly useCase: LoginByEmailUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'LoginByEmail')
  execute(
    request: LoginByEmailRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
