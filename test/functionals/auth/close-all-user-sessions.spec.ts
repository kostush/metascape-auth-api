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
import {
  GetWalletsByUserIdRequest,
  WalletsResponse,
} from 'metascape-wallet-api-client';
import {
  UserResponse,
  GetUserByEmailAndPasswordRequest,
  GetUserByIdRequest,
} from 'metascape-user-api-client';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { SessionNotFoundException } from '../../../src/auth/exceptions/session-not-found.exception';
import { SessionClient } from 'metascape-session-client';
import { SessionIsClosedException } from '../../../src/auth/exceptions/session-is-closed.exception';

describe('Close all user sessions functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let dataSource: DataSource;
  let sessionRedisClient: SessionClient;

  const mockUserPassword = 'password';
  const userId = 'cbf40ca2-edee-4a5b-9c05-026134dd70d8';
  const userMockResponse: UserResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: userId,
      email: 'test@test.com',
      nickname: 'nickname',
      firstName: 'firstName',
      lastName: 'lastName',
      about: 'about',
      createdBy: 'createdBy',
      updatedBy: 'updatedBy',
      createdAt: 1661180246,
      updatedAt: 1661180246,
    },
  };
  const walletsMockResponse: WalletsResponse = {
    data: [
      {
        businessId: userMockResponse?.data?.businessId as string,
        id: 'c04e3560-930d-4ad2-8c53-f60b7746b81e',
        address: '0x57D73c1896A339c866E6076e3c499F98840439C4',
        nonce: 'cbf40ca2-edee-4a5b-9c05-026134dd70d8',
        userId: userMockResponse?.data?.id,
        createdAt: 1661180246,
        updatedAt: 1661180246,
        createdBy: 'createdBy',
        updatedBy: 'updatedBy',
      },
    ],
  };
  const sessionId1 = '0c566c21-ebf7-4e98-a5df-8f23226ff13a';
  const sessionId2 = 'efce2025-c96f-4268-b5aa-6c0e0bdf5c5c';
  const mockSession1: SessionModel = {
    id: sessionId1,
    userId: userId,
    isClosed: false,
    createdAt: 1661180246,
    updatedAt: 1661180246,
  };
  const mockToken1: TokenModel = {
    id: '24a796d0-1998-4cff-b82c-fbee03169696',
    sessionId: sessionId1,
    isClosed: false,
    createdAt: 1661180246,
    updatedAt: 1661180246,
  };

  const mockSession2: SessionModel = {
    id: sessionId2,
    userId: userId,
    isClosed: false,
    createdAt: 1661180246,
    updatedAt: 1661180246,
  };
  const mockToken2: TokenModel = {
    id: '8fa705a7-32fd-4cbb-b596-b76994b4ee82',
    sessionId: sessionId2,
    isClosed: false,
    createdAt: 1661180246,
    updatedAt: 1661180246,
  };

  beforeAll(async () => {
    // run gRPC server
    app = await createMockAppHelper();
    dataSource = app.get(DataSource);
    sessionRedisClient = app.get(SessionClient);
    await app.listen();

    // create gRPC client
    clientProxy = createGrpcClientHelper();
    client = clientProxy.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

    // create mock wallet gRPC server
    walletService = createMockWalletServiceHelper({
      GetWalletsByUserId: (
        call: ServerUnaryCall<GetWalletsByUserIdRequest, WalletsResponse>,
        callback: sendUnaryData<WalletsResponse>,
      ) => {
        let error = null;
        if (call.request.userId !== walletsMockResponse.data[0].userId) {
          error = new GrpcException(status.NOT_FOUND, 'WalletNotFound', []);
        }
        callback(error, walletsMockResponse);
      },
    });
    await walletService.start();

    // create mock user gRPC server
    userService = createMockUserServiceHelper({
      GetUserByEmailAndPassword: (
        call: ServerUnaryCall<GetUserByEmailAndPasswordRequest, UserResponse>,
        callback: sendUnaryData<UserResponse>,
      ) => {
        let error = null;
        if (
          call.request.email !== userMockResponse.data?.email ||
          call.request.password !== mockUserPassword ||
          call.request.businessId !== userMockResponse.data?.businessId
        ) {
          error = new GrpcException(status.NOT_FOUND, 'UserIsNotFound', []);
        }
        callback(error, userMockResponse);
      },
      GetUserById: (
        call: ServerUnaryCall<GetUserByIdRequest, UserResponse>,
        callback: sendUnaryData<UserResponse>,
      ) => {
        let error = null;
        if (call.request.id !== userMockResponse.data?.id) {
          error = new GrpcException(status.NOT_FOUND, 'UserIsNotFound', []);
        }
        callback(error, userMockResponse);
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
  });

  it('should fail due to validation of wrong userId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.closeAllUserSessions({
          userId: 'wrong user id',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain('userId must be a UUID');
    }
  });

  it('should fail due to sessions does not exist', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    try {
      await lastValueFrom(
        client.closeAllUserSessions({
          userId: userId,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionNotFoundException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `sessions are not found by userId "${userId}`,
      );
    }
  });

  it('should fail due to session is closed', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    mockSession1.isClosed = true;
    await dataSource.getRepository(SessionModel).insert(mockSession1);
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: mockSession1.id,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionIsClosedException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `session ${mockSession1.id} is olready closed`,
      );
    }
  });

  it('should close all sessions succesfully', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    mockSession1.isClosed = false;
    mockSession2.isClosed = false;
    await dataSource.getRepository(SessionModel).insert(mockSession1);
    await dataSource.getRepository(TokenModel).insert(mockToken1);
    await dataSource.getRepository(SessionModel).insert(mockSession2);
    await dataSource.getRepository(TokenModel).insert(mockToken2);
    await lastValueFrom(
      client.closeAllUserSessions({
        userId: userId,
      }),
    );

    const sessionFromRepo1 = await dataSource
      .getRepository(SessionModel)
      .findOneBy({ id: mockSession1.id });
    const tokenFromRedis1 = await sessionRedisClient.getSession(
      mockSession1.id,
    );
    const sessionFromRepo2 = await dataSource
      .getRepository(SessionModel)
      .findOneBy({ id: mockSession2.id });
    const tokenFromRedis2 = await sessionRedisClient.getSession(
      mockSession2.id,
    );
    expect(sessionFromRepo1!.isClosed).toBe(true);
    expect(tokenFromRedis1).toBeNull();
    expect(sessionFromRepo2!.isClosed).toBe(true);
    expect(tokenFromRedis2).toBeNull();
  });
});
