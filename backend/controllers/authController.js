import db from "../config/db.js";
import bcrypt from "bcrypt";

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

export const login = (req, res) => {
  res.json({ message: "Login successful", user: req.user });
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
