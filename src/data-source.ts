import { DataSource } from "typeorm";
import dotenv = require("dotenv");
import { Query } from "./entity/Query";
import { User } from "./entity/User";
import { QueryData } from "./entity/QueryData";
import { Page } from "./entity/Page";
import { PageData } from "./entity/PageData";

dotenv.config();

const env = process.env.NODE_ENV;
export let AppDataSource: DataSource;

env.includes('test')
  ? (AppDataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_TEST_HOST,
      port: Number(process.env.DB_TEST_PORT),
      username: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
      synchronize: true,
      logging: false,
      entities: [Query, User, Page, QueryData, PageData],
      migrations: ["src/migrations/*.ts"],
      subscribers: [],
    }))
  : (AppDataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_PROD_HOST,
      port: Number(process.env.DB_PROD_PORT),
      username: process.env.DB_PROD_USER,
      password: process.env.DB_PROD_PASSWORD,
      database: process.env.DB_PROD_DATABASE,
      synchronize: true,
      logging: false,
      entities: [Query, User, Page, QueryData, PageData],
      migrations: ["src/migrations/*.ts"],
      subscribers: [],
    }));
