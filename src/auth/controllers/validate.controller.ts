import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { ValidateRequest } from '../requests/validate.request';
import { ValidateUseCase } from '../use-case/validate.use-case';
import { JwtPayloadDataDto } from '../responses/jwt-payload-data.dto';

@Controller()
export class ValidateController {
  constructor(private readonly useCase: ValidateUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<JwtPayloadDataDto>> {
    return this.useCase.execute(request);
  }
}