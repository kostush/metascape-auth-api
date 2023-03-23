import { BadRequestException, INestMicroservice } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '../../../src/auth/auth.pb';
import { lastValueFrom } from 'rxjs';
import { createMockAppHelper } from '../../helpers/create-mock-app.helper';
import { createGrpcClientHelper } from '../../helpers/create-grpc-client.helper';
import { status } from '@grpc/grpc-js';
import { GrpcExceptionFactory } from 'metascape-common-api';
import { GrpcMockServer } from '@alenon/grpc-mock-server';
import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { SessionNotFoundException } from '../../../src/auth/exceptions/session-not-found.exception';
import { SessionIsClosedException } from '../../../src/auth/exceptions/session-is-closed.exception';
import { SessionClient } from 'metascape-session-client';

describe('Close session functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let walletService: GrpcMockServer;
  let userService: GrpcMockServer;
  let dataSource: DataSource;
  let sessionRedisClient: SessionClient;
  const sessionId = 'c04e3560-930d-4ad2-8c53-f60b7746b81e';
  const mockSession: SessionModel = {
    id: sessionId,
    userId: 'cbf40ca2-edee-4a5b-9c05-026134dd70d8',
    isClosed: false,
    createdAt: 1661180246,
    updatedAt: 1661180246,
  };
  const mockToken: TokenModel = {
    id: '24a796d0-1998-4cff-b82c-fbee03169696',
    sessionId: sessionId,
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
  });

  beforeEach(async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});
    await sessionRedisClient.closeAllSessions([mockSession.id]);
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
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: mockSession.id,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionNotFoundException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `session is not found by id "${mockSession.id}`,
      );
    }
  });

  it('should fail due to session is closed', async () => {
    mockSession.isClosed = true;
    await dataSource.getRepository(SessionModel).insert(mockSession);
    try {
      await lastValueFrom(
        client.closeSession({
          sessionId: mockSession.id,
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.message).toBe(SessionIsClosedException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain(
        `session ${mockSession.id} is olready closed`,
      );
    }
  });

  it('should close session succesfully', async () => {
    mockSession.isClosed = false;
    await dataSource.getRepository(SessionModel).insert(mockSession);
    await dataSource.getRepository(TokenModel).insert(mockToken);
    await sessionRedisClient.setSession(mockSession.id, mockToken.id);
    const sessionFromRedis = await sessionRedisClient.getSession(
      mockSession.id,
    );
    await lastValueFrom(
      client.closeSession({
        sessionId: mockSession.id,
      }),
    );

    const sessionFromRedisAfterCloseSession =
      await sessionRedisClient.getSession(mockSession.id);

    const sessionFromRepo = await dataSource
      .getRepository(SessionModel)
      .findOneBy({ id: mockSession.id });
    const tokenFromRedis = await sessionRedisClient.getSession(mockSession.id);
    expect(sessionFromRepo!.isClosed).toBe(true);
    expect(tokenFromRedis).toBeNull();
    expect(sessionFromRedis).toEqual({ tokenId: mockToken.id });
    expect(sessionFromRedisAfterCloseSession).toBeNull();
  });
});
