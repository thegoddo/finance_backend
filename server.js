import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import specs from "./lib/swagger.js";
import logger from "./lib/logger.js";
import requestLogger from "./middlewares/logMiddleware.js";

// Routes
import recordRoutes from "./routes/recordRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Validate essential Env variables
const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET;
if (!JWT_SECRET) {
  logger.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const app = express();

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: "Too many requests. Please try again later." },
});

// Middlewares
app.use(requestLogger); // Log everything first
app.use(apiLimiter);
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use("/api/record", recordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`${err.message}`, {
    url: req.url,
    method: req.method,
    stack: err.stack,
  });
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Handle Uncaught Crashes
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
