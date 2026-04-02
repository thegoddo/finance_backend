import express from "express";
import {
  createRecord,
  getDashboardSummary,
} from "../controllers/recordController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records and dashboard summary endpoints
 *
 * components:
 *   schemas:
 *     CreateRecordRequest:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - category
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *           example: 1500.5
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: INCOME
 *         category:
 *           type: string
 *           example: Salary
 *         notes:
 *           type: string
 *           example: Monthly salary payment
 *
 *     Record:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         amount:
 *           type: number
 *           format: float
 *           example: 1500.5
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: INCOME
 *         category:
 *           type: string
 *           example: Salary
 *         notes:
 *           type: string
 *           example: Monthly salary payment
 *         userId:
 *           type: integer
 *           example: 3
 *
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
 *     ApiError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Validation error message
 *         message:
 *           type: string
 *           example: Not authorized.
 *
 * /records:
 *   post:
 *     summary: Create a financial record
 *     description: Create a new financial record for the authenticated user.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecordRequest'
 *     responses:
 *       201:
 *         description: Record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden. Requires ADMIN or ANALYST role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /records/summary:
 *   get:
 *     summary: Get dashboard summary
 *     description: Return income, expense, and net balance for the authenticated user.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// Admin & Analyst can create
router.post("/", protect, authorize("ADMIN", "ANALYST"), createRecord);

// Everyone (Viewer, Analyst, Admin) can see the dashboard
router.get("/summary", protect, getDashboardSummary);

export default router;
