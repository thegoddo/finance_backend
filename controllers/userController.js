import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import {
  createUserByAdminSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  uuidParamSchema,
} from "../lib/validationSchemas.js";
import { getValidationMessage } from "../lib/validation.js";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    logger.error("Get Users Error", { error: error.message });
    return res.status(500).json({ message: "Error fetching users." });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const parsedBody = createUserByAdminSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedBody.error),
      });
    }

    const { email, password, role, status } = parsedBody.data;
    const normalizedRole = role || "VIEWER";
    const normalizedStatus = status || "ACTIVE";

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: normalizedRole,
        status: normalizedStatus,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: createdUser,
    });
  } catch (error) {
    logger.error("Create User Error", { error: error.message });
    return res.status(500).json({ message: "Error creating user." });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const parsedParams = uuidParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedParams.error),
      });
    }

    const parsedBody = updateUserRoleSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedBody.error),
      });
    }

    const { id } = parsedParams.data;
    const { role } = parsedBody.data;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "User role updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Update User Role Error", { error: error.message });
    return res.status(500).json({ message: "Error updating user role." });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const parsedParams = uuidParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedParams.error),
      });
    }

    const parsedBody = updateUserStatusSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: getValidationMessage(parsedBody.error),
      });
    }

    const { id } = parsedParams.data;
    const { status } = parsedBody.data;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "User status updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Update User Status Error", { error: error.message });
    return res.status(500).json({ message: "Error updating user status." });
  }
};
