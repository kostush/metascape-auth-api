import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api';
import { AUTH_SERVICE_NAME, ValidateResponseData } from '../auth.pb';
import { ValidateRequest } from '../requests/validate.request';
import { ValidateUseCase } from '../use-case/validate.use-case';

@Controller()
export class ValidateController {
  constructor(private readonly useCase: ValidateUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<ValidateResponseData>> {
    return this.useCase.execute(request);
  }
}
