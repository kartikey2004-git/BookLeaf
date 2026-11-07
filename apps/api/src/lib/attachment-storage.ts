import { randomUUID } from "node:crypto";
import { Client } from "minio";
import type { ApiEnvironment } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain",
  "text/markdown",
]);

export type AttachmentStorage = { client: Client; bucket: string };

function createStorage(
  endpoint: string,
  port: number,
  useSSL: boolean,
  accessKey: string,
  secretKey: string,
  bucket: string,
): AttachmentStorage {
  return {
    client: new Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    }),
    bucket,
  };
}

export function getMinioAttachmentStorage(
  environment: ApiEnvironment | undefined,
): AttachmentStorage | null {
  const endpoint = environment?.MINIO_ENDPOINT;
  const accessKey = environment?.MINIO_ACCESS_KEY;
  const secretKey = environment?.MINIO_SECRET_KEY;
  const bucket = environment?.MINIO_BUCKET;
  if (!endpoint || !accessKey || !secretKey || !bucket) return null;
  return createStorage(
    endpoint,
    environment?.MINIO_PORT ?? 9000,
    environment?.MINIO_USE_SSL ?? false,
    accessKey,
    secretKey,
    bucket,
  );
}

function parseTigrisEndpoint(
  endpoint: string,
  defaultPort: number,
  defaultUseSSL: boolean,
): { endpoint: string; port: number; useSSL: boolean } {
  if (!endpoint.includes("://")) {
    return { endpoint, port: defaultPort, useSSL: defaultUseSSL };
  }
  const url = new URL(endpoint);
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("TIGRIS_ENDPOINT must not include a path, query, or hash");
  }
  return {
    endpoint: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
    useSSL: url.protocol === "https:",
  };
}

export function getTigrisAttachmentStorage(
  environment: ApiEnvironment | undefined,
): AttachmentStorage | null {
  const rawEndpoint = environment?.TIGRIS_ENDPOINT;
  const accessKey = environment?.TIGRIS_ACCESS_KEY;
  const secretKey = environment?.TIGRIS_SECRET_KEY;
  const bucket = environment?.TIGRIS_BUCKET;
  if (!rawEndpoint || !accessKey || !secretKey || !bucket) return null;
  const endpoint = parseTigrisEndpoint(
    rawEndpoint,
    environment?.TIGRIS_PORT ?? 443,
    environment?.TIGRIS_USE_SSL ?? true,
  );
  return createStorage(
    endpoint.endpoint,
    endpoint.port,
    endpoint.useSSL,
    accessKey,
    secretKey,
    bucket,
  );
}

async function ensureBucket(storage: AttachmentStorage): Promise<void> {
  if (!(await storage.client.bucketExists(storage.bucket))) {
    await storage.client.makeBucket(storage.bucket);
  }
}

export function createAttachmentObjectKey(fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180);
  return `tickets/${randomUUID()}-${safeName || "attachment"}`;
}

export async function uploadAttachment(
  storage: AttachmentStorage,
  objectKey: string,
  content: Buffer,
  mimeType: string,
): Promise<string> {
  await ensureBucket(storage);
  await storage.client.putObject(storage.bucket, objectKey, content, content.length, {
    "Content-Type": mimeType,
  });
  return storage.client.presignedGetObject(storage.bucket, objectKey, 24 * 60 * 60);
}

export function validateAttachmentFile(
  fileName: string,
  mimeType: string,
  size: number,
): void {
  if (!fileName.trim()) {
    throw new HttpError(400, "VALIDATION_ERROR", "Attachment file name is required");
  }
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Unsupported attachment type. Allowed: PDF, Word, image, text.",
    );
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new HttpError(
      413,
      "ATTACHMENT_TOO_LARGE",
      `Attachment must be between 1 byte and ${MAX_ATTACHMENT_SIZE_BYTES} bytes.`,
    );
  }
}
