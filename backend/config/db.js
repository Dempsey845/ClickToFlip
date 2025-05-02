import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const db = new pg.Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL, // For production
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
      }
);

export default db;
