import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api/dist';
import {
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from 'metascape-user-api-client/dist';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { LoginByEmailRequest } from '../requests/login-by-email.request';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LoginByEmailUseCase {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly usersServiceClient: UsersServiceClient,
    // @Inject(WALLETS_SERVICE_NAME) private readonly walletsServiceClient: WalletsServiceClient
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    request: LoginByEmailRequest,
  ): Promise<SuccessResponse<LoginResponseDataDto>> {
    // const userData = await lastValueFrom(
    //   this.usersServiceClient.getUserByEmailAndPassword(
    //     { businessId: request.businessId, email: request.email, password: request.password }
    //   )
    // )
    const userData = await lastValueFrom(
      this.usersServiceClient.getUserByEmail({
        businessId: request.businessId,
        email: request.email,
      }),
    );
    const token = this.jwtService.sign(userData);
    return new SuccessResponse(new LoginResponseDataDto(token));
  }
}
