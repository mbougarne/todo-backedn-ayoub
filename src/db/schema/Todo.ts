import { DataTypes } from "sequelize";
import { sequelizeConnection } from "../connect";

export const Todo = sequelizeConnection.define(
  "Todo",
  {
    todoId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    timestamps: true,
    modelName: "Todo",
  }
);
