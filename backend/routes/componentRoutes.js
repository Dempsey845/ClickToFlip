import express from "express";
import {
  getComponents,
  getGPUComponents,
  getCPUComponents,
  getMotherboardComponents,
  addUserComponent,
  updateUserComponent,
  getUserComponents,
  getUserComponentsByType,
  deleteComponent,
  deleteUserComponent,
} from "../controllers/componentController.js";

const router = express.Router();

router.get("/all", getComponents);
router.get("/gpu", getGPUComponents);
router.get("/cpu", getCPUComponents);
router.get("/motherboard", getMotherboardComponents);
router.post("/addUserComponent", addUserComponent);
router.patch("/updateUserComponent/:id", updateUserComponent);
router.get("/getUserComponents", getUserComponents);
router.get("/getUserComponents/:type", getUserComponentsByType);
router.delete("/buildComponents/:reference_id", deleteComponent);
router.delete("/userComponents/:component_id", deleteUserComponent);

export default router;
