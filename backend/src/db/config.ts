import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user";

const connection = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  username: "root",
  password: "",
  database: "mydb_dbscan",
  logging: false,
  models: [User],
});

export default connection;
