import { grpcConfigs } from '../../src/main.config';
import { ClientGrpcProxy } from '@nestjs/microservices';

export const createGrpcClientHelper = (): ClientGrpcProxy => {
  const clientProxy = new ClientGrpcProxy(grpcConfigs.options);
  clientProxy.loadProto();
  return clientProxy;
};
