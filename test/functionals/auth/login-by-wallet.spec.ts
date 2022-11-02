import { BadRequestException, INestMicroservice } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '../../../src/auth/auth.pb';
import { lastValueFrom } from 'rxjs';
import { createMockAppHelper } from '../../helpers/create-mock-app.helper';
import { createGrpcClientHelper } from '../../helpers/create-grpc-client.helper';
import { createMockUserServiceHelper } from '../../helpers/create-mock-user-service.helper';
import { createMockWalletServiceHelper } from '../../helpers/create-mock-wallet-service.helper';
import { sendUnaryData, ServerUnaryCall, status } from '@grpc/grpc-js';
import { GrpcException, GrpcExceptionFactory } from 'metascape-common-api';
import { GrpcMockServer } from '@alenon/grpc-mock-server';
import { SignNonceRequest, WalletResponse } from 'metascape-wallet-api-client';
import { GetUserByIdRequest, UserResponse } from 'metascape-user-api-client';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDataDto } from 'metascape-common-api';
import { WalletNotAttachedToUserException } from '../../../src/auth/exceptions/wallet-not-attached-to-user.exception';

describe('Login by wallet functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let jwtService: JwtService;
  const walletMockResponse: WalletResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: 'c04e3560-930d-4ad2-8c53-f60b7746b81e',
      address: '0x57D73c1896A339c866E6076e3c499F98840439C4',
      nonce: 'cbf40ca2-edee-4a5b-9c05-026134dd70d8',
      userId: 'a2717a71-8769-469c-9e3f-5f29557b73aa',
      createdAt: 1661180246,
      updatedAt: 1661180246,
    },
  };

  const walletWithoutUserMockResponse: WalletResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: 'c04e3560-930d-4ad2-8c53-f60b7746b815',
      address: '0x57D73c1896A339c866E6076e3c499F98840439C5',
      nonce: 'cbf40ca2-edee-4a5b-9c05-026134dd70d8',
      createdAt: 1661180246,
      updatedAt: 1661180246,
    },
  };
  const walletNotFoundAddress = '0x57D73c1896A339c866E6076e3c499F98840439C3';
  const userMockResponse: UserResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: 'c04e3560-930d-4ad2-8c53-f60b7746b81e',
      createdAt: 1661180246,
      updatedAt: 1661180246,
    },
  };
  const mockWalletsNotFoundMessage = 'wallet not found';

  beforeAll(async () => {
    // run gRPC server
    app = await createMockAppHelper();
    jwtService = app.get(JwtService);
    await app.listen();

    // create gRPC client
    clientProxy = createGrpcClientHelper();
    client = clientProxy.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

    // create mock wallet gRPC server
    walletService = createMockWalletServiceHelper({
      SignNonce: (
        call: ServerUnaryCall<SignNonceRequest, WalletResponse>,
        callback: sendUnaryData<WalletResponse>,
      ) => {
        let error = null;
        if (
          call.request.address === walletWithoutUserMockResponse.data!.address
        ) {
          callback(null, walletWithoutUserMockResponse);
          return;
        }
        if (call.request.address !== walletMockResponse.data!.address) {
          error = new GrpcException(status.NOT_FOUND, 'WalletNotFound', [
            mockWalletsNotFoundMessage,
          ]);
        }
        callback(error, walletMockResponse);
      },
    });
    await walletService.start();

    // create mock user gRPC server
    userService = createMockUserServiceHelper({
      GetUserById: (
        call: ServerUnaryCall<GetUserByIdRequest, UserResponse>,
        callback: sendUnaryData<UserResponse>,
      ) => {
        callback(null, userMockResponse);
      },
    });
    await userService.start();
  });

  afterAll(async () => {
    await app.close();
    await clientProxy.close();
    await walletService.stop();
    await userService.stop();
  });

  it('should fail due to validation of businessId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByWallet({
          businessId: 'test',
          address: walletMockResponse.data!.address,
          signature: 'signature',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain('businessId');
    }
  });

  it('should fail due to validation of address', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByWallet({
          businessId: walletMockResponse.data?.businessId as string,
          address: 'test',
          signature: 'signature',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain('address');
    }
  });

  it('should fail due to wallet not found error', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByWallet({
          businessId: walletMockResponse.data!.businessId,
          address: walletNotFoundAddress,
          signature: 'signature',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.NOT_FOUND);
      expect(grpcException.message).toBe('WalletNotFound');
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toBe(mockWalletsNotFoundMessage);
    }
  });

  it('should fail due to wallet without userId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByWallet({
          businessId: walletWithoutUserMockResponse.data!.businessId,
          address: walletWithoutUserMockResponse.data!.address,
          signature: 'signature',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.ALREADY_EXISTS);
      expect(grpcException.message).toBe(WalletNotAttachedToUserException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        walletWithoutUserMockResponse.data!.address,
      );
    }
  });

  it('should login user successfully', async () => {
    const res = await lastValueFrom(
      client.loginByWallet({
        businessId: walletMockResponse.data!.businessId,
        address: walletMockResponse.data!.address,
        signature: 'signature',
      }),
    );

    const jwtPayload = jwtService.verify<JwtPayloadDataDto>(
      res?.data?.authToken as string,
    );
    expect(jwtPayload.businessId).toBe(userMockResponse.data?.businessId);
    expect(jwtPayload.id).toBe(userMockResponse.data?.id);
  });
});
