import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  checkAuth,
  getUserData,
  changePassword,
  changeUsername,
  deleteAccount,
  getUsername,
  changeCurrency,
  getCurrency,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/logout", logout);
router.get("/check-auth", checkAuth);
router.get("/getUserData", getUserData);
router.get("/username/:userId", getUsername);
router.get("/currency/:userId", getCurrency);

router.patch("/changePassword", changePassword);
router.patch("/changeUsername", changeUsername);
router.patch("/changeCurrency", changeCurrency);

router.delete("/deleteAccount", deleteAccount);

export default router;
