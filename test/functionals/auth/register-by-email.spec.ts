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
import { sendUnaryData, ServerUnaryCall, status } from '@grpc/grpc-js';
import { GrpcExceptionFactory } from 'metascape-common-api';
import { GrpcMockServer } from '@alenon/grpc-mock-server';
import { CreateUserRequest, UserResponse } from 'metascape-user-api-client';

describe('Register by email functional tests', () => {
  let app: INestMicroservice;
  let client: AuthServiceClient;
  let clientProxy: ClientGrpcProxy;
  let userService: GrpcMockServer;
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
    await app.listen();

    // create gRPC client
    clientProxy = createGrpcClientHelper();
    client = clientProxy.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

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
    await app.close();
    await clientProxy.close();
    await userService.stop();
  });

  it('should fail due to validation of businessId', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.registerByEmail({
          businessId: 'test',
          email: '0x57D73c1896A339c866E6076e3c499F98840439C4',
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
        client.registerByEmail({
          businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
          email: 'invalid email',
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

  it('should fail due to validation of password', async () => {
    expect.hasAssertions();
    try {
      await lastValueFrom(
        client.registerByEmail({
          businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
          email: 'test@gmail.com',
          password: 'pas',
        }),
      );
    } catch (e) {
      const grpcException = GrpcExceptionFactory.createFromGrpcError(e);
      expect(grpcException.code).toBe(status.INVALID_ARGUMENT);
      expect(grpcException.message).toBe(BadRequestException.name);
      expect(grpcException.getErrors()).toBeInstanceOf(Array);
      expect(grpcException.getErrors()[0]).toContain('password');
    }
  });

  it('should register user successfully', async () => {
    const res = await lastValueFrom(
      client.registerByEmail({
        businessId: '9f4eb00d-ac78-49e6-80f2-5d635b48b365',
        email: 'test@gmail.com',
        password: 'password',
      }),
    );
    expect(res.data?.userId).toBe(userMockResponse.data?.id);
  });
});
