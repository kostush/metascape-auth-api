import { v4 as uuidv4, validate } from 'uuid';
import { TokenFactory } from '../../../../src/auth/factory/token-factory.service';
import { TokenModel } from '../../../../src/auth/models/token.model';

describe('TokenFactory', () => {
  let tokenFactory: TokenFactory;

  beforeEach(async () => {
    tokenFactory = new TokenFactory();
  });

  describe('createToken', () => {
    it('should return an full token object', async () => {
      const tokenId = uuidv4();
      const sessionId = uuidv4();
      const token = tokenFactory.createToken(tokenId, sessionId);
      expect(token).toBeInstanceOf(TokenModel);
      expect(validate(token.id)).toBe(true);
      expect(validate(token.sessionId)).toBe(true);
      expect(token.id).toBe(tokenId);
      expect(token.sessionId).toBe(sessionId);
      expect(token.isClosed).toBe(false);
      expect(token.createdAt).toBe(undefined);
      expect(token.updatedAt).toBe(undefined);
    });
  });
});
