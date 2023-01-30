import { JwtPayloadFactoryService } from '../../../../src/auth/factory/jwt-payload-factory.service';
import { UserResponseData } from 'metascape-user-api-client';
import { v4 as uuidv4 } from 'uuid';

describe('JwtPayloadFactoryService', () => {
  let jwtPayloadFactoryService: JwtPayloadFactoryService;

  beforeEach(async () => {
    jwtPayloadFactoryService = new JwtPayloadFactoryService();
  });

  describe('createJwtPayload', () => {
    it('should return an full jwt object', async () => {
      const businessId = '1bdbf2ce-3057-497c-9ddd-a076b6f598d6';
      const id = 'c04e3560-930d-4ad2-8c53-f60b7746b81e';
      const email = 'test@test.com';
      const nickname = 'nickname';
      const firstName = 'firstName';
      const lastName = 'lastName';
      const about = 'about';
      const createdAt = 1661180246;
      const updatedAt = 1661180246;

      const user: UserResponseData = {
        businessId: businessId,
        id: id,
        email: email,
        nickname: nickname,
        firstName: firstName,
        lastName: lastName,
        about: about,
        createdAt: createdAt,
        updatedAt: updatedAt,
      };

      const sessionId = uuidv4();
      const tokenId = uuidv4();
      const jwt = jwtPayloadFactoryService.createJwtPayload(
        user,
        sessionId,
        tokenId,
      );

      expect(jwt.businessId).toBe(businessId);
      expect(jwt.id).toBe(id);
      expect(jwt.sessionId).toBe(sessionId);
      expect(jwt.tokenId).toBe(tokenId);
    });
  });
});
