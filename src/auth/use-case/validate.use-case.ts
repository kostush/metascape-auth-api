import { BadRequestException, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api';
import { ValidateRequest } from '../requests/validate.request';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDataDto } from '../responses/jwt-payload-data.dto';

@Injectable()
export class ValidateUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<JwtPayloadDataDto>> {
    let user;
    try {
      user = this.jwtService.verify<JwtPayloadDataDto>(request.authToken, {
        publicKey: process.env.JWT_PRIVATE_KEY,
        algorithms: ['RS256'],
      });
    } catch (e) {
      throw new BadRequestException('Auth token is not valid or expired');
    }

    return new SuccessResponse(user);
  }
}
