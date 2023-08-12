import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user";
import { PasswordReset } from "../models/passResetTokens";

const connection = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  username: "root",
  password: "",
  database: "mydb_dbscan",
  logging: false,
  models: [User, PasswordReset],
});

export default connection;
