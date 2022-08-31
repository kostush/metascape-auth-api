import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api/dist';
import { RegisterResponseDataDto } from '../responses/register-response-data.dto';
import { RegisterByEmailRequest } from '../requests/register-by-email.request';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client/dist';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RegisterByEmailUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
  ) {}

  async execute(
    request: RegisterByEmailRequest,
  ): Promise<SuccessResponse<RegisterResponseDataDto>> {
    const userData = await lastValueFrom(
      this.usersServiceClient.createUser({
        businessId: request.businessId,
        email: request.email,
        password: request.password,
      }),
    );
    return new SuccessResponse(new RegisterResponseDataDto(userData.data!.id));
  }
}
