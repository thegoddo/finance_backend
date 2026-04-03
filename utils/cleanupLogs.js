import { readdir, unlink } from "fs/promises";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");
const dryRun = process.argv.includes("--dry-run");

const isLogFile = (fileName) => fileName.endsWith(".log");

try {
  const entries = await readdir(logsDir, { withFileTypes: true });
  const logFiles = entries.filter(
    (entry) => entry.isFile() && isLogFile(entry.name),
  );

  if (logFiles.length === 0) {
    console.log("No log files found to clean.");
    process.exit(0);
  }

  for (const file of logFiles) {
    const filePath = path.join(logsDir, file.name);

    if (dryRun) {
      console.log(`[dry-run] Would remove ${filePath}`);
      continue;
    }

    await unlink(filePath);
    console.log(`Removed ${filePath}`);
  }

  if (!dryRun) {
    console.log("Log cleanup completed.");
  }
} catch (error) {
  console.error(`Failed to clean logs: ${error.message}`);
  process.exit(1);
}
