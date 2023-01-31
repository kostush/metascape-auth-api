import { Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseFactoryInterface } from './login-response-factory.interface';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';

@Injectable()
export class LoginResponseFactoryService
  implements LoginResponseFactoryInterface
{
  createLoginResponse = (
    authJwt: string,
    refreshJwt: string,
  ): SuccessResponse<LoginResponseDataDto> => {
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  };
}
