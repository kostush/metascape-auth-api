import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api/dist';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { ValidateRequest } from '../requests/validate.request';
import { ValidateResponseDataDto } from '../responses/validate-response-data.dto';
import { ValidateUseCase } from '../use-case/validate.use-case';

@Controller()
export class ValidateController {
  constructor(private readonly useCase: ValidateUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<ValidateResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
