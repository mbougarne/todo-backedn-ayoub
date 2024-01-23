/* eslint-disable no-console */
import { Sequelize } from "sequelize";

export const sequelizeConnection = new Sequelize({
  dialect: 'sqlite',
  storage: './todos.sqlite'
})

export const createDatabase = async () => {
  try {
    await sequelizeConnection.authenticate()
    console.log("Connected")
  } catch (error) {
    console.error("Unable to connect to the db:", error)
  }
};
