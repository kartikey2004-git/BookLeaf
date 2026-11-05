type WorkerLogFields = Record<string, unknown>;

export function workerLog(
  level: "info" | "error",
  event: string,
  fields: WorkerLogFields = {},
): void {
  const entry = JSON.stringify({
    level,
    time: new Date().toISOString(),
    service: "bookleaf-worker",
    environment: process.env.NODE_ENV ?? "development",
    event,
    ...fields,
  });
  if (level === "error") console.error(entry);
  else console.info(entry);
}
