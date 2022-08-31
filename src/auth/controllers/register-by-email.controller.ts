import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api/dist';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { RegisterByEmailRequest } from '../requests/register-by-email.request';
import { RegisterResponseDataDto } from '../responses/register-response-data.dto';
import { RegisterByEmailUseCase } from '../use-case/register-by-email.use-case';

@Controller()
export class RegisterByEmailController {
  constructor(private readonly useCase: RegisterByEmailUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'RegisterByEmail')
  execute(
    request: RegisterByEmailRequest,
  ): Promise<SuccessResponse<RegisterResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
