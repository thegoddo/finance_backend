import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

if (!email) {
  console.error("Missing BOOTSTRAP_ADMIN_EMAIL.");
  process.exit(1);
}

try {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const updateData = {
      role: "ADMIN",
      status: "ACTIVE",
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
      select: { id: true, email: true, role: true, status: true },
    });

    console.log("Existing user promoted to ADMIN:", updatedUser);
  } else {
    if (!password) {
      console.error(
        "User not found. Provide BOOTSTRAP_ADMIN_PASSWORD to create a new ADMIN user.",
      );
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: { id: true, email: true, role: true, status: true },
    });

    console.log("New ADMIN user created:", createdUser);
  }
} catch (error) {
  console.error("Failed to bootstrap ADMIN:", error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
