import {
  protobufPackage,
  WALLETS_SERVICE_NAME,
} from 'metascape-wallet-api-client';
import { join } from 'path';
import { GrpcMockServer } from '@alenon/grpc-mock-server';

export const createMockWalletServiceHelper = (
  implementations: any,
): GrpcMockServer => {
  const server = new GrpcMockServer(process.env.WALLET_API_GRPC_URL);

  server.addService(
    join(
      __dirname,
      '../../node_modules/metascape-wallet-api-client/resources/proto/wallet.proto',
    ),
    protobufPackage,
    WALLETS_SERVICE_NAME,
    implementations,
  );

  return server;
};
