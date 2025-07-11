import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'restolover',
  entities: [join(process.cwd(), 'dist', '**', '*.entity.{js,ts}')],
  migrations: [join(process.cwd(), 'dist', 'migrations', '*.{js,ts}')],
  synchronize: false,
});
