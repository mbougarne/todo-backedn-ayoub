import { DataTypes } from "sequelize";
import { sequelizeConnection } from "../connect";

export const User = sequelizeConnection.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 75],
      },
    },
    refreshToken: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    modelName: "User",
  }
);
