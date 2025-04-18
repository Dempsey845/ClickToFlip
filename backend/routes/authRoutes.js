import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  checkAuth,
} from "../controllers/authController.js";

const router = express.Router();

// Remove '/api' here since it's already being used in the app.js file
router.post("/register", register);
router.post("/login", async (req, res, next) => {
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
});

router.get("/logout", logout);
router.get("/check-auth", checkAuth);

export default router;
