import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

const VALID_ROLES = ["ADMIN", "ANALYST", "VIEWER"];
const VALID_STATUS = ["ACTIVE", "INACTIVE"];

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
    const { email, password, role, status } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "A valid email is required." });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be a string with at least 8 characters.",
      });
    }

    const normalizedRole = role ? String(role).toUpperCase() : "VIEWER";
    const normalizedStatus = status ? String(status).toUpperCase() : "ACTIVE";

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed values: ${VALID_ROLES.join(", ")}.`,
      });
    }

    if (!VALID_STATUS.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${VALID_STATUS.join(", ")}.`,
      });
    }

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
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }

    const normalizedRole = String(role).toUpperCase();

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed values: ${VALID_ROLES.join(", ")}.`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: normalizedRole },
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
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const normalizedStatus = String(status).toUpperCase();

    if (!VALID_STATUS.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${VALID_STATUS.join(", ")}.`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: normalizedStatus },
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
