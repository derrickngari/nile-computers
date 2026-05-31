import mysql2 from "mysql2/promise"
import dotenv from "dotenv";
dotenv.config();
import retry from "async-retry";
import { logger } from "../services/logger.js";

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
});

const db = {
  query: async (sql, values) => {
    const start = Date.now();
    try {
      const [rows] = await pool.query(sql, values);
      const duration = Date.now() - start;
      console.log(`Query executed in ${duration}ms: ${sql}`);
      return rows;
    } catch (error) {
      console.log(`Error executing query: ${sql} - ${error.message}`);
      throw error;
    }
  },
  transaction: async (cb) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await cb(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

const dbConnection = async () => {
  await retry(
    async () => {
      await pool.query("SELECT 1");
      console.info("Connected to MySQL database");
      // console.log("Connected to MySQL database");
    },
    {
      factor: 2,
      retries: 5,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (error) => {
        console.warn(`Retrying MySQL connection: ${error.message}`);
        // console.log(`Retrying MySQL connection: ${error.message}`);
      },
    }
  ).catch((error) => {
    console.log(`Error connecting to MySQL Database: ${error.message}`);
    // console.log(`Error connecting to MySQL Database: ${error.message}`);
    process.exit(1);
  });
};

const disconnectDB = async () => {
  try {
    await pool.end();
    console.info("MySQL connection pool closed");
  } catch (error) {
    console.error("Error closing MySQL pool:", error.message);
  }
};

export {
  db,
  dbConnection,
  disconnectDB,
};