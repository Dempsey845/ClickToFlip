import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

config();

const PORT = process.env.PORT || 5000;
const FRONT_END_URL = process.env.FRONT_END_URL || "http://localhost:5000";
const SALTS = parseInt(process.env.SALTS || "10", 10);
const app = express();

// Allow requests from the frontend
app.use(
  cors({
    origin: FRONT_END_URL,
    credentials: true, // Allow cookies/session credentials
  })
);

// PostgreSQL DB Connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes
app.post("/api/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, SALTS);
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hash]
    );
    const user = result.rows[0];
    console.log("User registered: ", user);
  } catch (err) {
    console.error("Register error: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
