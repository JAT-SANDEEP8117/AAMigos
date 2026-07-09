import express from "express";
import { verifyAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import {
  createCompany,
  createModel,
  createServiceCenter,
  getAgents,
  getCatalog,
  getDetails,
  getServiceCenters,
  getStats,
} from "../controllers/adminControllers.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/getDetails", getDetails);
router.get("/stats", getStats);
router.get("/agents", getAgents);
router.get("/service-centers", getServiceCenters);
router.post("/service-centers", createServiceCenter);
router.get("/catalog", getCatalog);
router.post("/companies", createCompany);
router.post("/models", createModel);

export default router;
