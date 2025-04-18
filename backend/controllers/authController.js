import db from "../config/db.js";
import bcrypt from "bcrypt";
import passport from "passport";

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(
      password,
      parseInt(process.env.SALTS || "10", 10)
    );
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "Login successful", user: req.user });
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    req.session.destroy(() => res.json({ message: "Logout successful" }));
  });
};

export const checkAuth = (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated() });
};

export const getComponents = (req, res) => {
  db.query("SELECT (name, type) FROM components", (err, result) => {
    if (err) {
      console.error("Error fetching components:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(result.rows);
  });
};
