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

const createFileLogger = (filename, level = "info") =>
  winston.createLogger({
    level: "debug",
    format: logFormat,
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, filename),
        level,
      }),
    ],
  });

const logger = winston.createLogger({
  level: "debug", // Captures everything from debug up to error
  format: logFormat,
  transports: [
    // 1. General application events
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
    // 2. Only errors (crashes, unhandled exceptions)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
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

export const requestLogger = createFileLogger("requests.log");
export const authLogger = createFileLogger("auth.log");
export const adminLogger = createFileLogger("admin.log");
export const securityLogger = createFileLogger("security.log");
export const databaseLogger = createFileLogger("database.log", "debug");

export default logger;
