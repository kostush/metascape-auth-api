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

import { DataSource } from 'typeorm';
import { SessionModel } from '../../../src/auth/models/session.model';
import { TokenModel } from '../../../src/auth/models/token.model';
import { SessionClient } from 'metascape-session-client';

describe('Close all user sessions functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let dataSource: DataSource;
  let sessionRedisClient: SessionClient;

  const userId = 'cbf40ca2-edee-4a5b-9c05-026134dd70d8';
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
  });

  beforeEach(async () => {
    sessionRedisClient.closeAllSessions([sessionId1, sessionId2]);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (clientProxy) {
      await clientProxy.close();
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

  it('should close all sessions succesfully', async () => {
    await dataSource.getRepository(SessionModel).delete({});
    await dataSource.getRepository(TokenModel).delete({});

    mockSession1.isClosed = false;
    mockSession2.isClosed = false;
    await dataSource.getRepository(SessionModel).insert(mockSession1);
    await dataSource.getRepository(TokenModel).insert(mockToken1);
    await sessionRedisClient.setSession(mockSession1.id, mockToken1.id);
    const sessionFromRedisBefore1 = await sessionRedisClient.getSession(
      mockSession1.id,
    );

    await dataSource.getRepository(SessionModel).insert(mockSession2);
    await dataSource.getRepository(TokenModel).insert(mockToken2);
    await sessionRedisClient.setSession(sessionId2, mockToken2.id);
    const sessionFromRedisBefore2 = await sessionRedisClient.getSession(
      mockSession2.id,
    );

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
    expect(sessionFromRedisBefore1).toEqual({ tokenId: mockToken1.id });
    expect(sessionFromRedisBefore2).toEqual({ tokenId: mockToken2.id });
    expect(await sessionRedisClient.getSession(mockSession1.id)).toBeNull();
    expect(await sessionRedisClient.getSession(mockSession2.id)).toBeNull();
  });
});
