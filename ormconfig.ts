import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [__dirname + '/src/**/*.schema{.ts,.js}'],
  subscribers: [],
  migrations: [__dirname + '/migration/**/*{.ts,.js}'],
});
