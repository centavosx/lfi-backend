import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  Appointment,
  Token,
  User,
  ContactUs,
  Replies,
  Role,
  Services,
  Availability,
  UserTransaction,
  UserPayment,
  Product,
  ProductReview,
} from '../entities';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  entities: [
    Appointment,
    Token,
    User,
    ContactUs,
    Replies,
    Role,
    Services,
    Availability,
    UserTransaction,
    UserPayment,
    Product,
    ProductReview,
  ],
  migrations: ['dist/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
