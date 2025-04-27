import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  checkAuth,
  getUserData,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/logout", logout);
router.get("/check-auth", checkAuth);
router.get("/getUserData", getUserData);

export default router;
