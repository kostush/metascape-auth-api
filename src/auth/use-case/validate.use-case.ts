import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { ValidateRequest } from '../requests/validate.request';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDataDto } from 'metascape-common-api';
import { ValidateResponseData } from '../auth.pb';
import PARAMETERS from '../../params/params.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidateUseCase {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<ValidateResponseData>> {
    let user;
    try {
      user = this.jwtService.verify<JwtPayloadDataDto>(request.authToken, {
        publicKey: this.configService.get(PARAMETERS.JWT_AUTH_PUBLIC_KEY),
      });
    } catch (e) {
      throw new BadRequestException('Auth token is not valid or expired');
    }

    return new SuccessResponse(user);
  }
}
