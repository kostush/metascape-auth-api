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
    return new JwtPayloadDataDto(
      user.businessId,
      user.id,
      wallets.map((e) => e.address),
      user.createdAt,
      user.updatedAt,
      user.email,
      user.nickname,
      user.firstName,
      user.lastName,
      user.about,
    );
  }
}
