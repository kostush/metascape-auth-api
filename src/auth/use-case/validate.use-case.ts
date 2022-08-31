import { BadRequestException, Injectable } from '@nestjs/common';
import { SuccessResponse } from 'metascape-common-api/dist';
import { ValidateRequest } from '../requests/validate.request';
import { ValidateResponseDataDto } from '../responses/validate-response-data.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ValidateUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(
    request: ValidateRequest,
  ): Promise<SuccessResponse<ValidateResponseDataDto>> {
    let user;
    try {
      user = this.jwtService.verify(request.authToken);
    } catch (e) {
      throw new BadRequestException('Auth token is not valid or expired');
    }

    return new SuccessResponse(new ValidateResponseDataDto(user.data.id));
  }
}
