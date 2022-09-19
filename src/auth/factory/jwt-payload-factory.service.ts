import { Injectable } from '@nestjs/common';
import { JwtPayloadFactoryInterface } from './jwt-payload-factory.interface';
import { UserResponseData } from 'metascape-user-api-client';
import { WalletResponseData } from 'metascape-wallet-api-client';
import { JwtPayloadDataDto } from '../responses/jwt-payload-data.dto';

@Injectable()
export class JwtPayloadFactoryService implements JwtPayloadFactoryInterface {
  createJwtPayload(
    user: UserResponseData,
    wallets: WalletResponseData[],
  ): JwtPayloadDataDto {
    return {
      businessId: user.businessId,
      id: user.id,
      wallets: wallets.map((e) => e.address),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      about: user.about,
    };
  }
}
