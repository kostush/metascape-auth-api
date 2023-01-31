import {
  BadRequestException,
  ConflictException,
  INestMicroservice,
} from '@nestjs/common';
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
import { TokenRepositoryInterface } from '../../../src/auth/repositories/token-repository.interface';
import { SessionRepositoryInterface } from '../../../src/auth/repositories/session-repository.interface';
import { AuthTokenInterface } from '../../../src/auth-token/services/auth-token.interface';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { SessionNotFoundException } from '../../../src/auth/exceptions/session-not-found.exception';

describe('Close session functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let tokenRepository: TokenRepositoryInterface;
  let sessionRepository: SessionRepositoryInterface;
  let authTokenService: AuthTokenInterface;
  let dataSource: DataSource;

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
    tokenRepository = app.get(TokenRepositoryInterface);
    sessionRepository = app.get(SessionRepositoryInterface);
    dataSource = app.get(DataSource);
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
    await app.close();
    await clientProxy.close();
    await walletService.stop();
    await userService.stop();
  });

  it('should fail due to validation of wrong sessionId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: 'wrong session id',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        'sessionId must be a UUID',
      );
    }
  });

  it('should fail due to session does not exist', async () => {
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const authTokenDto = authTokenService.verify(res.data!.authToken);
    const session = await sessionRepository.getOneById(authTokenDto.sessionId);
    await sessionRepository.delete(session);
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: session.id,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionNotFoundException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `session is not found by id "${session.id}`,
      );
    }
  });

  it('should fail due to session is closed', async () => {
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const authTokenDto = authTokenService.verify(res.data!.authToken);
    const session = await sessionRepository.getOneById(authTokenDto.sessionId);
    session.isClosed = true;
    await sessionRepository.update(session);
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: session.id,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(ConflictException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `session ${session.id} is olready closed`,
      );
    }
  });

  it('should close session succesfully', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const res = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const authTokenDto = authTokenService.verify(res.data!.authToken);
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: authTokenDto.sessionId,
        }),
      );
    } catch (e) {
      expect(e).toBeUndefined();
    }

    const sessionFromRepo = await sessionRepository.getOneById(
      authTokenDto.sessionId,
    );
    const tokenFromRepo = await tokenRepository.getOneById(
      authTokenDto.tokenId,
    );
    expect(sessionFromRepo).toBeDefined();
    expect(tokenFromRepo).toBeDefined();
    expect(sessionFromRepo.isClosed).toBe(true);
    expect(tokenFromRepo.isClosed).toBe(true);
  });

  it('should close session and related tokens succesfully after refresh', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    const resultAfterLogin = await lastValueFrom(
      client.loginByEmail({
        businessId: userMockResponse.data?.businessId as string,
        email: userMockResponse.data?.email as string,
        password: mockUserPassword as string,
      }),
    );
    const authTokenPayload = authTokenService.verify(
      resultAfterLogin.data!.authToken,
    );
    const resultAfterRefresh = await lastValueFrom(
      client.refresh({
        refreshToken: resultAfterLogin.data!.refreshToken,
      }),
    );
    await lastValueFrom(
      client.closeSession({
        sessionId: authTokenPayload.sessionId,
      }),
    );

    const sessionFromRepo = await sessionRepository.getOneById(
      authTokenPayload.sessionId,
    );
    const tokenFromRepoAfterAuth = await tokenRepository.getOneById(
      authTokenPayload.tokenId,
    );
    const authTokenPayloadAfterRefresh = authTokenService.verify(
      resultAfterRefresh.data!.authToken,
    );
    const tokenFromRepoAfterRefresh = await tokenRepository.getOneById(
      authTokenPayloadAfterRefresh.tokenId,
    );

    expect(sessionFromRepo).toBeDefined();
    expect(tokenFromRepoAfterAuth).toBeDefined();
    expect(tokenFromRepoAfterRefresh).toBeDefined();
    expect(sessionFromRepo.isClosed).toBe(true);
    expect(tokenFromRepoAfterAuth.isClosed).toBe(true);
    expect(tokenFromRepoAfterRefresh.isClosed).toBe(true);
  });
});
