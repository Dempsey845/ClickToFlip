import express from "express";
import {
  getComponents,
  getGPUComponents,
  getCPUComponents,
  getMotherboardComponents,
} from "../controllers/componentController.js";

const router = express.Router();

router.get("/all", getComponents);
router.get("/gpu", getGPUComponents);
router.get("/cpu", getCPUComponents);
router.get("/motherboard", getMotherboardComponents);

export default router;
