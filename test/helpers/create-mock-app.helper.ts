import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { grpcConfigs } from '../../src/main.config';
import { INestMicroservice } from '@nestjs/common';

export const createMockAppHelper = async (): Promise<INestMicroservice> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  return moduleFixture.createNestMicroservice(grpcConfigs);
};
