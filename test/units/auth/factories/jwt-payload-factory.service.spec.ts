import { JwtPayloadFactoryService } from '../../../../src/auth/factory/jwt-payload-factory.service';
import { UserResponseData } from 'metascape-user-api-client';
import { WalletResponseData } from 'metascape-wallet-api-client';

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
      const address = '0x57D73c1896A339c866E6076e3c499F98840439C4';
      const nonce = 'cbf40ca2-edee-4a5b-9c05-026134dd70d8';
      const userId = 'a2717a71-8769-469c-9e3f-5f29557b73aa';
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
      const wallets: WalletResponseData[] = [
        {
          businessId: businessId,
          id: id,
          address: address,
          nonce: nonce,
          userId: userId,
          createdAt: createdAt,
          updatedAt: updatedAt,
        },
      ];
      const jwt = jwtPayloadFactoryService.createJwtPayload(user, wallets);

      expect(jwt.businessId).toBe(businessId);
      expect(jwt.id).toBe(id);
      expect(jwt.wallets[0]).toBe(address);
      expect(jwt.email).toBe(email);
      expect(jwt.nickname).toBe(nickname);
      expect(jwt.firstName).toBe(firstName);
      expect(jwt.lastName).toBe(lastName);
      expect(jwt.about).toBe(about);
      expect(jwt.createdAt).toBe(createdAt);
      expect(jwt.updatedAt).toBe(updatedAt);
    });
  });
});
