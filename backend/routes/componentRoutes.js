import express from "express";
import {
  getComponents,
  getGPUComponents,
  getCPUComponents,
  getMotherboardComponents,
  addUserComponent,
} from "../controllers/componentController.js";

const router = express.Router();

router.get("/all", getComponents);
router.get("/gpu", getGPUComponents);
router.get("/cpu", getCPUComponents);
router.get("/motherboard", getMotherboardComponents);
router.post("/addUserComponent", addUserComponent);

export default router;
