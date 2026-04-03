import dotenv from "dotenv";
dotenv.config();
import swaggerUi from "swagger-ui-express";
import specs from "./lib/swagger.js";
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import requestLogger from "./middlewares/logMiddleware.js";
import logger from "./lib/logger.js";
import recordRoutes from "./routes/recordRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

if (!process.env.SECRET) {
  throw new Error("SECRET environment variable is required for JWT auth.");
}

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(requestLogger); // This starts the file logging for every route

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); //swagger page

logger.info("Swagger docs available at http://localhost:5000/api-docs");

//routes
app.use("/api/record/", recordRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Global Error Handler (Log every unhandled error to error.log)
app.use((err, req, res, next) => {
  logger.error(`${err.message}`, {
    url: req.url,
    method: req.method,
    stack: err.stack,
  });
  res.status(500).json({ message: "Internal Server Error" });
});

// Catch system crashes
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

app.listen(5000, () => logger.info("Server started on port 5000"));
