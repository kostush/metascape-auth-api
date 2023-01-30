import { v4 as uuidv4, validate } from 'uuid';
import { SessionFactory } from '../../../../src/auth/factory/session-factory.service';
import { SessionModel } from '../../../../src/auth/models/session.model';

describe('SessionFactory', () => {
  let sessionFactory: SessionFactory;

  beforeEach(async () => {
    sessionFactory = new SessionFactory();
  });

  describe('create session', () => {
    it('should return an full session object', async () => {
      const mocUserId = uuidv4();
      const session = sessionFactory.createSession(mocUserId);

      expect(session).toBeInstanceOf(SessionModel);
      expect(validate(session.id)).toBe(true);
      expect(validate(session.userId)).toBe(true);
      expect(session.userId).toBe(mocUserId);
      expect(session.isClosed).toBe(false);
      expect(session.createdAt).toBe(null);
      expect(session.updatedAt).toBe(null);
    });
  });
});
