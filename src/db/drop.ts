import { createConnection } from "mariadb";
import { DB_CONFIGS } from "../config";

const dropDbForTests = async () => {
  const con = await createConnection({
    host: DB_CONFIGS.MYSQL_HOST,
    user: DB_CONFIGS.MYSQL_USER,
    password: DB_CONFIGS.MYSQL_PASS,
  });

  await con
    .query(`DROP DATABASE IF EXISTS ${DB_CONFIGS.MYSQL_DB};`)
    .finally(() => {});
};

dropDbForTests();
