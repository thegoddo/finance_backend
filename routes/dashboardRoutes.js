import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import {
  authMiddleware as protect,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics endpoints
 *
 * components:
 *   schemas:
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         totalIncome:
 *           type: number
 *           format: float
 *           example: 5000
 *         totalExpense:
 *           type: number
 *           format: float
 *           example: 2500
 *         netBalance:
 *           type: number
 *           format: float
 *           example: 2500
 *
 *     DashboardCategoryBreakdownItem:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           example: Salary
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: INCOME
 *         _sum:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               format: float
 *               example: 3000
 *
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         summary:
 *           $ref: '#/components/schemas/DashboardSummary'
 *         categoryBreakdown:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardCategoryBreakdownItem'
 *         recentActivity:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Record'
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               date:
 *                 type: string
 *                 format: date-time
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Failed to generate dashboard summary.
 *
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary data
 *     description: Return summary totals, category breakdown, recent activity, and trends for the authenticated user.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error while building dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// All authenticated roles (Admin, Analyst, Viewer) can view the dashboard
router.get(
  "/summary",
  protect,
  authorize("ADMIN", "ANALYST", "VIEWER"),
  getDashboardSummary,
);

export default router;
