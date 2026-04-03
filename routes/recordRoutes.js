import express from "express";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "../controllers/recordController.js";
import {
  authMiddleware as protect,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management endpoints
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
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2026-04-03T08:00:00.000Z
 *         notes:
 *           type: string
 *           example: Monthly salary payment
 *
 *     UpdateRecordRequest:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *           example: 1450.75
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: EXPENSE
 *         category:
 *           type: string
 *           example: Food
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2026-04-02T18:30:00.000Z
 *         notes:
 *           type: string
 *           example: Updated monthly grocery expense
 *
 *     Record:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 99c96034-d4ff-4669-ae1a-34162d96ab60
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
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2026-04-03T08:00:00.000Z
 *         notes:
 *           type: string
 *           example: Monthly salary payment
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 551ac54e-0f8c-4ef8-b2fc-cc4ad1594f45
 *
 *     RecordsListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Record'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 42
 *             totalPages:
 *               type: integer
 *               example: 5
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
 * /api/record:
 *   get:
 *     summary: Get all financial records
 *     description: Return the authenticated user's records with optional filters. Access is restricted to ADMIN and ANALYST roles. Date filters are inclusive (`startDate` uses `>=`, `endDate` uses `<=`) and should be passed as ISO 8601 date-time values.
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         description: Partial text search across category and notes.
 *         schema:
 *           type: string
 *           example: salary
 *       - in: query
 *         name: page
 *         description: Page number for pagination (minimum 1).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Records per page for pagination (1 to 100).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *       - in: query
 *         name: startDate
 *         description: Inclusive lower bound for record date/time. Example for day filtering start - `2026-04-03T00:00:00.000Z`.
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-04-03T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         description: Inclusive upper bound for record date/time. Example for full-day filtering end - `2026-04-03T23:59:59.999Z`.
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2026-04-03T23:59:59.999Z
 *     responses:
 *       200:
 *         description: Records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecordsListResponse'
 *       400:
 *         description: Invalid query parameters
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
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error while fetching records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   post:
 *     summary: Create a financial record
 *     description: Create a new financial record for the authenticated user.
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
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
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /api/record/{id}:
 *   put:
 *     summary: Update a financial record
 *     description: Update an existing record that belongs to the authenticated user.
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecordRequest'
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Record not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error while updating record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   delete:
 *     summary: Delete a financial record
 *     description: Soft delete a record by id by setting `deletedAt`. Only ADMIN role can perform this action.
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record soft-deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden. Requires ADMIN role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error while deleting record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// Admin and Analyst can view records
router.get("/", protect, authorize("ADMIN", "ANALYST"), getRecords);

// Admin and Analyst can create and update
router.post("/", protect, authorize("ADMIN", "ANALYST"), createRecord);
router.put("/:id", protect, authorize("ADMIN", "ANALYST"), updateRecord);

// Only Admin can delete
router.delete("/:id", protect, authorize("ADMIN"), deleteRecord);

export default router;
