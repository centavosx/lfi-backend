import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  Token,
  User,
  Role,
  Events,
  Announcements,
  UserFiles,
  Scholar,
} from '../entities';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  entities: [Token, User, Events, Announcements, Role, UserFiles, Scholar],
  migrations: ['dist/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
