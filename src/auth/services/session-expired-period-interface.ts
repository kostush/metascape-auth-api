export interface SessionExpiredPeriodInterface {
  generateExpiredPeriod(): number;
}

export const SessionExpiredPeriodInterface = Symbol(
  'SessionExpiredPeriodInterface',
);
