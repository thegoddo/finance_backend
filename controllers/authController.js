import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js"; // Ensure .js extension
import logger from "../lib/logger.js";

const generateToken = (user) => {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.SECRET, {
    expiresIn: "1d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUserAlreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User Already Exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "VIEWER",
        status: "ACTIVE",
      },
    });

    const token = generateToken(user);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    logger.error("Registration Error", {
      message: error.message,
      email: req.body.email,
    });
    res.status(500).json({ message: "Server Error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (user.status === "INACTIVE") {
      return res
        .status(403)
        .json({ message: "Account is inactive. Contact admin." });
    }

    const token = generateToken(user);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully!",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error("Login Error", {
      message: error.message,
      email: req.body.email,
    });
    res.status(500).json({ message: "Server Error during login." });
  }
};
