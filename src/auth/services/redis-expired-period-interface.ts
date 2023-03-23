export interface RedisExpiredPeriodInterface {
  generateExpiredPeriod(): number;
}

export const RedisExpiredPeriodInterface = Symbol(
  'RedisExpiredPeriodInterface',
);
