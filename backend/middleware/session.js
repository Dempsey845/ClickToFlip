import session from "express-session";
import pgSession from "connect-pg-simple";
import db from "../config/db.js";
import { config } from "dotenv";

config();

const PgSession = pgSession(session);

const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: new PgSession({ pool: db, tableName: "session" }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true, // Prevents JS access to cookie
    sameSite: isProduction ? "None" : "Lax", // Allow cross-site only in prod
    secure: isProduction, // HTTPS-only in production
  },
});

export default sessionMiddleware;
