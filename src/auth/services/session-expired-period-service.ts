import { Inject, Injectable } from '@nestjs/common';
import PARAMETERS from '../../params/params.constants';
import { SessionExpiredPeriodInterface } from './session-expired-period-interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

@Injectable()
export class SessionExpiredPeriodService
  implements SessionExpiredPeriodInterface
{
  constructor(
    @Inject(PARAMETERS.JWT_AUTH_EXPIRES_IN)
    private readonly jwtAuthExpiresIn: string,
  ) {}
  generateExpiredPeriod(): number {
    return Math.round(ms(this.jwtAuthExpiresIn) / 1000);
  }
}
