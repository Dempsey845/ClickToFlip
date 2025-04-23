import express from "express";
import {
  getComponents,
  getGPUComponents,
  getCPUComponents,
  getMotherboardComponents,
  addUserComponent,
  updateUserComponent,
} from "../controllers/componentController.js";

const router = express.Router();

router.get("/all", getComponents);
router.get("/gpu", getGPUComponents);
router.get("/cpu", getCPUComponents);
router.get("/motherboard", getMotherboardComponents);
router.post("/addUserComponent", addUserComponent);
router.patch("/updateUserComponent/:id", updateUserComponent);

export default router;
