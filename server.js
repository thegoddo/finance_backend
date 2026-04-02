import dotenv from "dotenv";
dotenv.config();
import express from "express";
import requestLogger from "./middlewares/logMiddleware.js";
import logger from "./lib/logger.js";

const app = express();

app.use(express.json());
app.use(requestLogger); // This starts the file logging for every route

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
