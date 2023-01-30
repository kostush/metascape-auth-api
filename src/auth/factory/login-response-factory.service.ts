import { Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { LoginResponseFactoryInterface } from './login-response-factory.interface';
import { LoginResponseDataDto } from '../responses/login-response-data.dto';
import { JwtPayloadFactoryInterface } from './jwt-payload-factory.interface';

@Injectable()
export class LoginResponseFactoryService
  implements LoginResponseFactoryInterface
{
  constructor(
    @Inject(JwtPayloadFactoryInterface)
    private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
  ) {}
  createLoginResponse = (
    authJwt: string,
    refreshJwt: string,
  ): SuccessResponse<LoginResponseDataDto> => {
    return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
  };
}
