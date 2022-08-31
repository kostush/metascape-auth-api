import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api/dist';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { RegisterResponseDataDto } from '../responses/register-response-data.dto';
import { RegisterByWalletRequest } from '../requests/register-by-wallet.request';
import { RegisterByWalletUseCase } from '../use-case/register-by-wallet.use-case';

@Controller()
export class RegisterByWalletController {
  constructor(private readonly useCase: RegisterByWalletUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'RegisterByWallet')
  execute(
    request: RegisterByWalletRequest,
  ): Promise<SuccessResponse<RegisterResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
