import "dotenv/config";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { databaseLogger } from "./logger.js";

// Parse DATABASE_URL to extract connection parameters
const dbUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1), // Remove leading slash
  port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
});

const prisma = new PrismaClient({
  adapter: adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

// Capture and log every SQL query sent to MySQL
prisma.$on("query", (e) => {
  databaseLogger.debug({
    message: "Query",
    query: e.query,
    params: e.params,
    durationMs: e.duration,
  });
});

prisma.$on("warn", (e) => databaseLogger.warn(e.message));
prisma.$on("info", (e) => databaseLogger.info(e.message));
prisma.$on("error", (e) => databaseLogger.error(e.message));

export default prisma;
