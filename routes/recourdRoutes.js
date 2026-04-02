import express from "express";
import {
  createRecord,
  getDashboardSummary,
} from "../controllers/recordController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin & Analyst can create
router.post("/", protect, authorize("ADMIN", "ANALYST"), createRecord);

// Everyone (Viewer, Analyst, Admin) can see the dashboard
router.get("/summary", protect, getDashboardSummary);

export default router;
