import { protobufPackage, USERS_SERVICE_NAME } from 'metascape-user-api-client';
import { join } from 'path';
import { GrpcMockServer } from '@alenon/grpc-mock-server';

export const createMockUserServiceHelper = (
  implementations: any,
): GrpcMockServer => {
  const server = new GrpcMockServer(process.env.USER_API_GRPC_URL);

  server.addService(
    join(
      __dirname,
      '../../node_modules/metascape-user-api-client/resources/proto/user.proto',
    ),
    protobufPackage,
    USERS_SERVICE_NAME,
    implementations,
  );

  return server;
};
