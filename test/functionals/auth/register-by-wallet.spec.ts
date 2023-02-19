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
import { GrpcExceptionFactory } from 'metascape-common-api';
import { GrpcMockServer } from '@alenon/grpc-mock-server';
import {
  CreateWalletRequest,
  WalletResponse,
} from 'metascape-wallet-api-client';
import { CreateUserRequest, UserResponse } from 'metascape-user-api-client';
import { SessionClient } from 'metascape-session-client';

describe('Register by wallet functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let sessionRedisClient: SessionClient;
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
  const userMockResponse: UserResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: 'c04e3560-930d-4ad2-8c53-f60b7746b81e',
      createdAt: 1661180246,
      updatedAt: 1661180246,
    },
  };

  beforeAll(async () => {
    // run gRPC server
    app = await createMockAppHelper();
    sessionRedisClient = app.get(SessionClient);
    await app.listen();

    // create gRPC client
    clientProxy = createGrpcClientHelper();
    client = clientProxy.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

    // create mock wallet gRPC server
    walletService = createMockWalletServiceHelper({
      CreateWallet: (
        call: ServerUnaryCall<CreateWalletRequest, WalletResponse>,
        callback: sendUnaryData<WalletResponse>,
      ) => {
        callback(null, walletMockResponse);
      },
    });
    await walletService.start();

    // create mock user gRPC server
    userService = createMockUserServiceHelper({
      CreateUser: (
        call: ServerUnaryCall<CreateUserRequest, UserResponse>,
        callback: sendUnaryData<UserResponse>,
      ) => {
        callback(null, userMockResponse);
      },
    });
    await userService.start();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (clientProxy) {
      await clientProxy.close();
    }
    if (walletService) {
      await walletService.stop();
    }
    if (userService) {
      await userService.stop();
    }
    if (sessionRedisClient) {
      await sessionRedisClient.disconnect();
    }
  });

  it('should fail due to validation of businessId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.registerByWallet({
          businessId: 'test',
          address: '0x57D73c1896A339c866E6076e3c499F98840439C4',
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
        client.registerByWallet({
          businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
          address: 'test',
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

  it('should register user successfully', async () => {
    const res = await lastValueFrom(
      client.registerByWallet({
        businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
        address: '0x57D73c1896A339c866E6076e3c499F98840439C4',
      }),
    );
    expect(res.data?.userId).toBe(walletMockResponse.data?.userId);
    expect(res.data?.id).toBe(walletMockResponse.data?.id);
    expect(res.data?.businessId).toBe(walletMockResponse.data?.businessId);
    expect(res.data?.address).toBe(walletMockResponse.data?.address);
    expect(res.data?.nonce).toBe(walletMockResponse.data?.nonce);
    expect(res.data?.createdAt).toBe(walletMockResponse.data?.createdAt);
    expect(res.data?.updatedAt).toBe(walletMockResponse.data?.updatedAt);
    expect(res.data?.createdBy).toBe(walletMockResponse.data?.createdBy);
    expect(res.data?.updatedBy).toBe(walletMockResponse.data?.updatedBy);
  });
});
