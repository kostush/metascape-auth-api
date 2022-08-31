import { GrpcOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';
import { Transport } from '@nestjs/microservices';
import { protobufPackage } from './auth/auth.pb';
import { join } from 'path';

export const grpcConfigs: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: process.env.AUTH_API_GRPC_URL,
    package: protobufPackage,
    protoPath: join(__dirname, '../resources/proto/auth.proto'),
    loader: {
      longs: Number,
    },
  },
};
