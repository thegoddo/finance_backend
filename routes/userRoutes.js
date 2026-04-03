import express from "express";
import {
  createUserByAdmin,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/userController.js";
import {
  authMiddleware as protect,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin user and access management endpoints
 *
 * components:
 *   schemas:
 *     ManagedUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: f4579061-73c6-46f7-bf08-187c84609504
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         role:
 *           type: string
 *           enum: [ADMIN, ANALYST, VIEWER]
 *           example: ANALYST
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           example: ACTIVE
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateManagedUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: analyst@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 *         role:
 *           type: string
 *           enum: [ADMIN, ANALYST, VIEWER]
 *           example: ANALYST
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           example: ACTIVE
 *
 *     UpdateUserRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [ADMIN, ANALYST, VIEWER]
 *           example: VIEWER
 *
 *     UpdateUserStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           example: INACTIVE
 *
 *     MessageWithUser:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User updated successfully.
 *         user:
 *           $ref: '#/components/schemas/ManagedUser'
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Invalid role.
 *
 * /api/users:
 *   get:
 *     summary: List users
 *     description: List all users with role and status information. Admin only.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ManagedUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. Requires ADMIN role.
 *
 *   post:
 *     summary: Create user
 *     description: Create a new user with a specific role and status. Admin only.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateManagedUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageWithUser'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. Requires ADMIN role.
 *
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Update role for a specific user. Admin only.
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageWithUser'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. Requires ADMIN role.
 *       404:
 *         description: User not found
 *
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     description: Update status for a specific user. Admin only.
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageWithUser'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. Requires ADMIN role.
 *       404:
 *         description: User not found
 */

router.get("/", protect, authorize("ADMIN"), getUsers);
router.post("/", protect, authorize("ADMIN"), createUserByAdmin);
router.patch("/:id/role", protect, authorize("ADMIN"), updateUserRole);
router.patch("/:id/status", protect, authorize("ADMIN"), updateUserStatus);

export default router;
