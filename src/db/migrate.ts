import { sequelizeConnection, createDatabase } from "./connect";
import { User, Todo } from "./schema";

User.hasMany(Todo);
Todo.belongsTo(User);

const { error: errorLog } = console;

export const syncAndInit = async () => {
  try {
    await createDatabase();
    await sequelizeConnection.sync({ force: true });
    process.exit(0);
  } catch (error) {
    errorLog("migrate.ts module catch error => ", error);
  }
};

syncAndInit();
