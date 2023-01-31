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
} from 'metascape-user-api-client';
import { AuthTokenInterface } from '../../../src/auth-token/services/auth-token.interface';
import { RefreshTokenInterface } from '../../../src/refresh-token/services/refresh-token.interface';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { TokenRepositoryInterface } from '../../../src/auth/repositories/token-repository.interface';
import { SessionRepositoryInterface } from '../../../src/auth/repositories/session-repository.interface';

describe('Register by wallet functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let authTokenService: AuthTokenInterface;
  let refreshTokenService: RefreshTokenInterface;
  let dataSource: DataSource;
  let tokenRepository: TokenRepositoryInterface;
  let sessionRepository: SessionRepositoryInterface;

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
    tokenRepository = app.get(TokenRepositoryInterface);
    sessionRepository = app.get(SessionRepositoryInterface);
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
        client.loginByEmail({
          businessId: 'wrong',
          email: 'test@test.com',
          password: 'password',
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

  it('should fail due to validation of email', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByEmail({
          businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
          email: 'wrong',
          password: 'password',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain('email');
    }
  });

  it('should fail due to user not found error', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.loginByEmail({
          businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
          email: 'uknown@gmail.com',
          password: 'password',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.NOT_FOUND);
      expect(grpcException.message).toBe('UserIsNotFound');
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors().length).toBe(0);
    }
  });

  it('should login user successfully', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const authJwtPayload = authTokenService.verify(
      res?.data?.authToken as string,
    );
    const refreshJwtPayload = refreshTokenService.verify(
      res?.data?.refreshToken as string,
    );

    const sessionFromRepoAfterLogin = await sessionRepository.getOneById(
      authJwtPayload.sessionId,
    );
    const tokenFromRepoAfterLogin = await tokenRepository.getOneById(
      authJwtPayload.tokenId,
    );

    expect(res.data?.refreshToken).toBeDefined();
    expect(res.data?.authToken).toBeDefined();
    expect(authJwtPayload.businessId).toBe(userMockResponse.data?.businessId);
    expect(authJwtPayload.id).toBe(userMockResponse.data?.id);
    expect(authJwtPayload.sessionId).toBeDefined();
    expect(authJwtPayload.tokenId).toBeDefined();
    expect(refreshJwtPayload.tokenId).toBe(authJwtPayload.tokenId);
    expect(sessionFromRepoAfterLogin).toBeDefined();
    expect(sessionFromRepoAfterLogin.isClosed).toBe(false);
    expect(sessionFromRepoAfterLogin.id).toEqual(
      tokenFromRepoAfterLogin.sessionId,
    );
    expect(tokenFromRepoAfterLogin).toBeDefined();
    expect(tokenFromRepoAfterLogin.isClosed).toBe(false);
  });
});
