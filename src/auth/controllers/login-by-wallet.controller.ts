import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SuccessResponse } from 'metascape-common-api/dist';
import { AUTH_SERVICE_NAME } from '../auth.pb';
import { LoginByWalletRequest } from '../requests/login-by-wallet.request';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { LoginByWalletUseCase } from '../use-case/login-by-wallet.use-case';

@Controller()
export class LoginByWalletController {
  constructor(private readonly useCase: LoginByWalletUseCase) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'LoginByWallet')
  execute(
    request: LoginByWalletRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    return this.useCase.execute(request);
  }
}
