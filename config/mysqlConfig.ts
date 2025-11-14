import { createPool, Pool, createConnection, Connection } from "mysql";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create MySQL connection pool
const mysqlPool: Pool = createPool({
  host:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_HOST_DEV
      : process.env.MYSQL_HOST_PRODUCTION,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_USER_DEV
      : process.env.MYSQL_USER_PRODUCTION,
  database:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_DATABASE_DEV
      : process.env.MYSQL_DATABASE_PRODUCTION,
  password:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_PASSWORD_DEV
      : process.env.MYSQL_PASSWORD_PRODUCTION,
  connectionLimit: 10,
});

// Create a connection for transactions
export const transactionConnection: Connection = createConnection({
  host:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_HOST_DEV
      : process.env.MYSQL_HOST_PRODUCTION,
  port: parseInt(process.env.MYSQL_PORT || "3306"), // Convert port to number
  user:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_USER_DEV
      : process.env.MYSQL_USER_PRODUCTION,
  database:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_DATABASE_DEV
      : process.env.MYSQL_DATABASE_PRODUCTION,
  password:
    process.env.NODE_ENV === "development"
      ? process.env.MYSQL_PASSWORD_DEV
      : process.env.MYSQL_PASSWORD_PRODUCTION,
});

// Log connection status
mysqlPool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Connection Error", err.stack, err.message);
    process.exit(1); // Terminate application on connection error
  }
  console.log("Connected to MySQL");
  connection.release(); // Release the connection
});

// Handle unexpected errors in the connection pool
mysqlPool.on("error", (err) => {
  console.error("MySQL Pool Error", err.stack);
  process.exit(1); // Terminate application on pool error
});

export default mysqlPool;
