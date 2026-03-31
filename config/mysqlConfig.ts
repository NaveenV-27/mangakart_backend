import { createPool, Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

interface MySQLEnv {
  MYSQL_HOST_DEV: string;
  MYSQL_PORT_DEV: string;
  MYSQL_USER_DEV: string;
  MYSQL_PASSWORD_DEV: string;
  MYSQL_DATABASE_DEV: string;

  MYSQL_HOST_PRODUCTION: string;
  MYSQL_PORT_PRODUCTION: string;
  MYSQL_USER_PRODUCTION: string;
  MYSQL_PASSWORD_PRODUCTION: string;
  MYSQL_DATABASE_PRODUCTION: string;

  NODE_ENV: "development" | "production";
}

const env = process.env as unknown as MySQLEnv;

const isDev = env.NODE_ENV === "development";

const db: Pool = createPool({
  host: isDev ? env.MYSQL_HOST_DEV : env.MYSQL_HOST_PRODUCTION,
  port: parseInt(isDev ? env.MYSQL_PORT_DEV : env.MYSQL_PORT_PRODUCTION, 10),
  user: isDev ? env.MYSQL_USER_DEV : env.MYSQL_USER_PRODUCTION,
  password: isDev ? env.MYSQL_PASSWORD_DEV : env.MYSQL_PASSWORD_PRODUCTION,
  database: isDev ? env.MYSQL_DATABASE_DEV : env.MYSQL_DATABASE_PRODUCTION,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  namedPlaceholders: true,
});

(async () => {
  try {
    // console.log("HOST:", process.env.MYSQL_HOST_PRODUCTION, isDev);
    const conn = await db.getConnection();
    console.log("MySQL Connected");
    conn.release();
  } catch (err) {
    console.error("MySQL Connection Failed:", err);
    process.exit(1);
  }
})();

export default db;