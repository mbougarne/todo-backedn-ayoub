import dotenv from 'dotenv';

dotenv.config();

export const APP_CONFIGS = {
  APP_MODE: process.env.APP_ENV,
  APP_PORT: process.env.APP_PORT,
  APP_HOST: process.env.APP_HOSTNAME
}

export const JWT_CONFIGS = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
}

export const DB_CONFIGS = {
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASS: process.env.MYSQL_PASS,
  MYSQL_DB: process.env.MYSQL_DB,
  MYSQL_DIALECT: process.env.MYSQL_DIALECT
}
