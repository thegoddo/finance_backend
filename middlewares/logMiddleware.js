import logger from "../lib/logger.js";

const requestLogger = (req, res, next) => {
  // Log the start of the request
  logger.info({
    message: `Incoming Request`,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Optional: Log when the response finishes
  res.on("finish", () => {
    const level = res.statusCode >= 400 ? "error" : "info";
    logger.log(
      level,
      `Response Sent: ${req.method} ${req.url} [${res.statusCode}]`,
    );
  });

  next();
};

export default requestLogger;
