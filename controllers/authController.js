import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import logger from "../lib/logger.js";

async function registerUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    const isUserAlreadyExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User Already Exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "VIEWER",
        status: "ACTIVEl",
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, { httpOnlye: true });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error("Registration Error", {
      message: error.message,
      stack: error.stack,
      email: req.body.email,
    });

    res.status(500).json({
      success: false,
      message: "Server Error during registration. Please try again later.",
    });
  }
}

async function loginUser(req, res) {}
