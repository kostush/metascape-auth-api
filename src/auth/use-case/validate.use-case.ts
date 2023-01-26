import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { ValidateRequest } from '../requests/validate.request';
import { ValidateResponseData } from '../auth.pb';
import { AuthTokenInterface } from '../../auth-token/services/auth-token.interface';

@Injectable()
export class ValidateUseCase {
  constructor(
    @Inject(AuthTokenInterface)
    private readonly authTokenService: AuthTokenInterface,
  ) {}

  async execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<ValidateResponseData>> {
    let user;
    try {
      user = this.authTokenService.verify(request.authToken);
    } catch (e) {
      throw new BadRequestException('Auth token is not valid or expired');
    }

    return new SuccessResponse(user);
  }
}
