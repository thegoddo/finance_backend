import dotenv from "dotenv";
dotenv.config();
import swaggerUi from "swagger-ui-express";
import specs from "./lib/swagger.js";
import express from "express";
import requestLogger from "./middlewares/logMiddleware.js";
import logger from "./lib/logger.js";
import recordRoutes from "./routes/recordRoutes.js";

const app = express();

app.use(express.json());
app.use(requestLogger); // This starts the file logging for every route

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); //swagger page

logger.info("Swagger docs available at http://localhost:5000/api-docs");

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

//routes
app.use("/api/record", recordRoutes);

app.listen(5000, () => logger.info("Server started on port 5000"));
