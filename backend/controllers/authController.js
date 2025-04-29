import db from "../config/db.js";
import bcrypt from "bcrypt";
import passport from "passport";

export const register = async (req, res) => {
  const { email, password, username } = req.body;
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
      "INSERT INTO users (email, password, user_name) VALUES ($1, $2, $3) RETURNING *",
      [email, hashed, username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;

  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Unauthorized" });

  if (!newPassword)
    return res.status(400).json({ message: "New password is required" });

  try {
    const hashed = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALTS || "10", 10)
    );

    const result = await db.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashed, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
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

export const getUserData = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  }
};

export const changeUsername = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { username } = req.body;
  const userId = req.user.id;

  try {
    await db.query("UPDATE users SET user_name = $1 WHERE id = $2", [
      username,
      userId,
    ]);
    return res.status(200).json({ message: "Successfully changed username" });
  } catch (err) {
    console.error("Error changing username:", err);
    res.status(500).json({ message: "Server error" });
  }
};
