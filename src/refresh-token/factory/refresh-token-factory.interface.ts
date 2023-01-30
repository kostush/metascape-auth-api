export interface RefreshTokenFactoryInterface {
  createToken(tokenId: string): string;
}

export const RefreshTokenFactoryInterface = Symbol('RefreshTokenFactory');
