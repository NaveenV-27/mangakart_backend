import mysql from 'mysql2/promise';

const connectMySQL = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    console.log("MySQL connected");
    return connection;
  } catch (error) {
    console.error("MySQL connection failed:", error);
    process.exit(1);
  }
};

export default connectMySQL;
