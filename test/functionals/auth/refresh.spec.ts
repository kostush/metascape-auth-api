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
import { AuthTokenInterface } from '../../../src/auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../../src/refresh-token/services/refresh-token.interface';
import { TokenIsClosedException } from '../../../src/auth/exceptions/token-is-closed.exception';
import { SessionIsClosedException } from '../../../src/auth/exceptions/session-is-closed.exception';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { SessionClient } from 'metascape-session-client';

describe('Refresh functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let refreshTokenService: RefreshTokenInterface;
  let authTokenService: AuthTokenInterface;
  let dataSource: DataSource;
  let sessionRedisClient: SessionClient;

  const mockUserPassword = 'password';
  const userMockResponse: UserResponse = {
    data: {
      businessId: '1bdbf2ce-3057-497c-9ddd-a076b6f598d6',
      id: 'c04e3560-930d-4ad2-8c53-f60b7746b81e',
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

  beforeAll(async () => {
    // run gRPC server
    app = await createMockAppHelper();
    authTokenService = app.get(AuthTokenInterface);
    refreshTokenService = app.get(RefreshTokenInterface);
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
    if (sessionRedisClient) {
      await sessionRedisClient.disconnect();
    }
  });

  it('should fail due to validation of wrong refreshToken', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.refresh({
          refreshToken: 'wrong token',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        'refreshToken must be a jwt string',
      );
    }
  });

  it('should fail due to token is closed', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const refreshTokenDto = refreshTokenService.verify(res.data!.refreshToken);
    await dataSource
      .getRepository(TokenModel)
      .update(refreshTokenDto.tokenId, { isClosed: true });
    try {
      await lastValueFrom(
        client.refresh({
          refreshToken: res?.data?.refreshToken as string,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(TokenIsClosedException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `Token ${refreshTokenDto.tokenId} is closed`,
      );
    }
  });

  it('should fail due to session is closed', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const refreshTokenDto = refreshTokenService.verify(res.data!.refreshToken);
    const token = await dataSource
      .getRepository(TokenModel)
      .findOneBy({ id: refreshTokenDto.tokenId });

    await dataSource
      .getRepository(SessionModel)
      .update(token!.sessionId, { isClosed: true });
    try {
      await lastValueFrom(
        client.refresh({
          refreshToken: res?.data?.refreshToken as string,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionIsClosedException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `Session ${token!.sessionId} is closed`,
      );
    }
  });

  it('should refresh succesfully', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const resultAfterLogin = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const refreshResult = await lastValueFrom(
      client.refresh({
        refreshToken: resultAfterLogin?.data?.refreshToken as string,
      }),
    );

    const authTokenAfterLoginPayload = authTokenService.verify(
      resultAfterLogin.data!.authToken,
    );
    const authTokenAfterRefreshPayload = authTokenService.verify(
      refreshResult.data!.authToken,
    );
    const refreshTokenAfterRefreshPayload = refreshTokenService.verify(
      refreshResult.data!.refreshToken,
    );
    const sessionFromRepoAfterLogin = await dataSource
      .getRepository(SessionModel)
      .findOneBy({ id: authTokenAfterLoginPayload.sessionId });

    const tokenFromRepoAfterLogin = await dataSource
      .getRepository(TokenModel)
      .findOneBy({ id: authTokenAfterLoginPayload.tokenId });

    const sessionFromRepoAfterRefresh = await dataSource
      .getRepository(SessionModel)
      .findOneBy({ id: authTokenAfterRefreshPayload.sessionId });

    const tokenFromRepoAfterRefresh = await dataSource
      .getRepository(TokenModel)
      .findOneBy({ id: authTokenAfterRefreshPayload.tokenId });
    const sessionFromRedis = await sessionRedisClient.getSession(
      authTokenAfterRefreshPayload.sessionId,
    );

    expect(refreshResult.data?.authToken).toBeDefined();
    expect(refreshResult.data?.refreshToken).toBeDefined();
    expect(authTokenAfterRefreshPayload.id).toBe(userMockResponse.data!.id);
    expect(authTokenAfterRefreshPayload.businessId).toBe(
      userMockResponse.data!.businessId,
    );
    expect(authTokenAfterRefreshPayload.sessionId).toBeDefined();
    expect(authTokenAfterRefreshPayload.tokenId).toBeDefined();
    expect(refreshTokenAfterRefreshPayload.tokenId).toBeDefined();
    expect(sessionFromRepoAfterRefresh).toBeDefined();
    expect(sessionFromRepoAfterRefresh!.isClosed).toBe(false);
    expect(sessionFromRepoAfterRefresh!.id).toBe(sessionFromRepoAfterLogin!.id);
    expect(tokenFromRepoAfterRefresh).toBeDefined();
    expect(tokenFromRepoAfterLogin!.isClosed).toBe(true);
    expect(tokenFromRepoAfterRefresh!.isClosed).toBe(false);
    expect(sessionFromRedis?.tokenId).toBe(
      authTokenAfterRefreshPayload.tokenId,
    );
  });
});
