import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  timestamps: false,
  tableName: "resetPassTokens",
})
export class PasswordReset extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  token!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userEmail!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;
}
