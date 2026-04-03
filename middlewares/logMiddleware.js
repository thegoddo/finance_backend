import {
  adminLogger,
  authLogger,
  requestLogger as requestFileLogger,
  securityLogger,
} from "../lib/logger.js";

const isAdminActivity = (req) =>
  req.user?.role === "ADMIN" ||
  req.originalUrl.startsWith("/api/users") ||
  req.originalUrl.endsWith("/restore") ||
  (req.method === "DELETE" && req.originalUrl.startsWith("/api/record"));

const isAuthActivity = (req) => req.originalUrl.startsWith("/api/auth");

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const requestMeta = {
    message: `Incoming Request`,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  requestFileLogger.info(requestMeta);
  if (isAuthActivity(req)) {
    authLogger.info(requestMeta);
  }

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const responseMeta = {
      message: `Response Sent`,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userRole: req.user?.role ?? "ANONYMOUS",
    };

    requestFileLogger.info(responseMeta);

    if (isAuthActivity(req)) {
      authLogger.info(responseMeta);
    }

    if (isAdminActivity(req)) {
      adminLogger.info(responseMeta);
    }

    if (
      res.statusCode === 401 ||
      res.statusCode === 403 ||
      res.statusCode === 429
    ) {
      securityLogger.warn(responseMeta);
    }
  });

  next();
};

export default requestLogger;
