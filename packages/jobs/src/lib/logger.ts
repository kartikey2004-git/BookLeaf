type JobsLogFields = Record<string, unknown>;

export function jobsLog(
  level: "info" | "error",
  event: string,
  fields: JobsLogFields = {},
): void {
  const entry = JSON.stringify({
    level,
    time: new Date().toISOString(),
    service: "bookleaf-jobs",
    environment: process.env.NODE_ENV ?? "development",
    event,
    ...fields,
  });
  if (level === "error") console.error(entry);
  else console.info(entry);
}
