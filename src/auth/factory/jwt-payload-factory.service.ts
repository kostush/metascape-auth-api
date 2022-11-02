import { Injectable } from '@nestjs/common';
import { JwtPayloadFactoryInterface } from './jwt-payload-factory.interface';
import { UserResponseData } from 'metascape-user-api-client';
import { JwtPayloadDataDto } from 'metascape-common-api';

@Injectable()
export class JwtPayloadFactoryService implements JwtPayloadFactoryInterface {
  createJwtPayload(user: UserResponseData): JwtPayloadDataDto {
    return {
      businessId: user.businessId,
      id: user.id,
    };
  }
}
