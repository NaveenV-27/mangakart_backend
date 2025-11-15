"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionConnection = void 0;
const mysql_1 = require("mysql");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Create MySQL connection pool
const mysqlPool = (0, mysql_1.createPool)({
    host: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_HOST_DEV
        : process.env.MYSQL_HOST_PRODUCTION,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_USER_DEV
        : process.env.MYSQL_USER_PRODUCTION,
    database: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_DATABASE_DEV
        : process.env.MYSQL_DATABASE_PRODUCTION,
    password: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_PASSWORD_DEV
        : process.env.MYSQL_PASSWORD_PRODUCTION,
    connectionLimit: 10,
});
// Create a connection for transactions
exports.transactionConnection = (0, mysql_1.createConnection)({
    host: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_HOST_DEV
        : process.env.MYSQL_HOST_PRODUCTION,
    port: parseInt(process.env.MYSQL_PORT || "3306"), // Convert port to number
    user: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_USER_DEV
        : process.env.MYSQL_USER_PRODUCTION,
    database: process.env.NODE_ENV === "development"
        ? process.env.MYSQL_DATABASE_DEV
        : process.env.MYSQL_DATABASE_PRODUCTION,
    password: process.env.NODE_ENV === "development"
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
exports.default = mysqlPool;
