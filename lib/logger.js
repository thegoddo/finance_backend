import winston from "winston";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: "debug", // Captures everything from debug up to error
  format: logFormat,
  transports: [
    // 1. All system activity & requests
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
    // 2. Only errors (Status 400-500, DB crashes)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    // 3. Raw Database Queries
    new winston.transports.File({
      filename: path.join(logDir, "database.log"),
      level: "debug",
    }),
  ],
});

// Output to console during development for visibility
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default logger;
