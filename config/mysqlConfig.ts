import { createPool, Pool, PoolConnection } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Define interface for environment variables
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

// Typecast process.env
const env = process.env as unknown as MySQLEnv;

// Create MySQL connection pool
const mysqlPool: Pool = createPool({
  host: env.NODE_ENV === "development" ? env.MYSQL_HOST_DEV : env.MYSQL_HOST_PRODUCTION,
  port: parseInt(env.NODE_ENV === "development" ? env.MYSQL_PORT_DEV : env.MYSQL_PORT_PRODUCTION, 10),
  user: env.NODE_ENV === "development" ? env.MYSQL_USER_DEV : env.MYSQL_USER_PRODUCTION,
  password: env.NODE_ENV === "development" ? env.MYSQL_PASSWORD_DEV : env.MYSQL_PASSWORD_PRODUCTION,
  database: env.NODE_ENV === "development" ? env.MYSQL_DATABASE_DEV : env.MYSQL_DATABASE_PRODUCTION,
  connectionLimit: 10,
  multipleStatements: true,
});

// Use promise-based pool for async/await queries
export const db = mysqlPool.promise();

// Optional: separate connection for transactions (typed)
export const transactionConnection: PoolConnection = mysqlPool.getConnection((err: any, connection: any) => {
  if (err) {
    console.error("MySQL Connection Error", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");
  connection.release();
}) as unknown as PoolConnection;

// Handle unexpected errors in the pool
mysqlPool.on("error", (err: any) => {
  console.error("MySQL Pool Error", err);
  process.exit(1);
});

export default mysqlPool;
