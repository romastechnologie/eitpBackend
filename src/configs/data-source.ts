import { DataSource } from "typeorm"
require("dotenv").config();
export const myDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["src/modules/**/entity/*.js"],
    subscribers: ["src/modules/**/subscriber/*.js"],
    migrations: [""],
    migrationsTableName: "migrations",
    logging: true,  
    synchronize: true,
}) 