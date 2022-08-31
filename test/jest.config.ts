import type { Config } from '@jest/types';
import { join } from 'path';
import { config as dconfig } from 'dotenv';

dconfig({ path: join(__dirname, '../.env.test') });

// Sync object
const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/test'],
  rootDir: '../',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  testTimeout: 50000,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
};
export default config;
