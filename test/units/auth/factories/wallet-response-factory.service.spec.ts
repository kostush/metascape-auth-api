import { SuccessResponse } from 'metascape-common-api';
import { WalletResponseFactory } from '../../../../src/auth/factory/wallet-response-factory.service';
import { RegisterByWalletResponseDataDto } from '../../../../src/auth/responses/register-by-wallet-response-data.dto';

describe('WalletResponseFactory', () => {
  let walletResponseFactory: WalletResponseFactory;

  beforeEach(async () => {
    walletResponseFactory = new WalletResponseFactory();
  });

  describe('getWallet', () => {
    it('should return wallet response', async () => {
      const walletModel = new RegisterByWalletResponseDataDto(
        'businessId',
        'id',
        'address',
        'nonce',
        'userId',
        1,
        2,
        'createdBy',
        'updatedBy',
      );
      const response = walletResponseFactory.createWalletResponse(walletModel);
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.data).toBeInstanceOf(RegisterByWalletResponseDataDto);
      expect(response.data.id).toBe(walletModel.id);
      expect(response.data.businessId).toBe(walletModel.businessId);
      expect(response.data.address).toBe(walletModel.address);
      expect(response.data.nonce).toBe(walletModel.nonce);
      expect(response.data.userId).toBe(walletModel.userId);
      expect(response.data.createdAt).toBe(walletModel.createdAt);
      expect(response.data.updatedAt).toBe(walletModel.updatedAt);
      expect(response.data.createdBy).toBe(walletModel.createdBy);
      expect(response.data.updatedBy).toBe(walletModel.updatedBy);
    });
  });
});
