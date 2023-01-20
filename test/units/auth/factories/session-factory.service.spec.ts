import { v4 as uuidv4, validate } from 'uuid';
import { TokenModel } from '../../../../src/auth/models/token.model';
import { SessionFactory } from '../../../../src/auth/factory/session-factory.service';
import { SessionModel } from '../../../../src/auth/models/session.model';

describe('SessionFactory', () => {
  let sessionFactory: SessionFactory;

  beforeEach(async () => {
    sessionFactory = new SessionFactory();
  });

  describe('createToken', () => {
    it('should return an full token object', async () => {
      const userId = uuidv4();
      const sessionId = uuidv4();
      const isClosed = false;
      const mockToken = new TokenModel(uuidv4(), sessionId, isClosed);

      const session = sessionFactory.createSession(
        sessionId,
        userId,
        mockToken,
      );
      expect(session).toBeInstanceOf(SessionModel);
      expect(validate(session.id)).toBe(true);
      expect(validate(session.userId)).toBe(true);
      expect(session.id).toBe(sessionId);
      expect(session.userId).toBe(userId);
      expect(session.isClosed).toBe(false);
      expect(session.createdAt).toBe(undefined);
      expect(session.updatedAt).toBe(undefined);
    });
  });
});
