import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv = require('dotenv');
import { Keywords } from './entity/Keywords';
import { User } from './entity/User';


dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_PROD_HOST,
    port: Number(process.env.DB_PROD_PORT),
    username: process.env.DB_PROD_USER,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_DATABASE,
    synchronize: true,
    logging: false,
    entities: [Keywords, User],
    migrations: [],
    subscribers: []
})
