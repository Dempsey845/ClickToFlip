import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  checkAuth,
  getComponents,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/logout", logout);
router.get("/check-auth", checkAuth);

router.get("/getcomponents", getComponents);

export default router;
