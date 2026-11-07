import type { ApiEnvironment } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";
import { Client } from "minio";
import { randomUUID } from "node:crypto";

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

export type CloudinaryUploadTarget = {
  uploadUrl: string;
  uploadPreset: string;
  cloudName: string;
};

type MinioAttachmentStorage = {
  client: Client;
  bucket: string;
};

export function getMinioAttachmentStorage(
  environment: ApiEnvironment | undefined,
): MinioAttachmentStorage | null {
  const endpoint = environment?.MINIO_ENDPOINT;
  const accessKey = environment?.MINIO_ACCESS_KEY;
  const secretKey = environment?.MINIO_SECRET_KEY;
  const bucket = environment?.MINIO_BUCKET;
  if (!endpoint || !accessKey || !secretKey || !bucket) return null;
  return {
    client: new Client({
      endPoint: endpoint,
      port: environment?.MINIO_PORT ?? 9000,
      useSSL: environment?.MINIO_USE_SSL ?? false,
      accessKey,
      secretKey,
    }),
    bucket,
  };
}

async function ensureMinioBucket(storage: MinioAttachmentStorage): Promise<void> {
  if (!(await storage.client.bucketExists(storage.bucket))) {
    await storage.client.makeBucket(storage.bucket);
  }
}

export function createMinioObjectKey(fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180);
  return `tickets/${randomUUID()}-${safeName || "attachment"}`;
}

async function minioSignedUrl(
  storage: MinioAttachmentStorage,
  objectKey: string,
): Promise<string> {
  return storage.client.presignedGetObject(storage.bucket, objectKey, 24 * 60 * 60);
}

export async function uploadToMinio(
  storage: MinioAttachmentStorage,
  objectKey: string,
  content: Buffer,
  mimeType: string,
): Promise<string> {
  await ensureMinioBucket(storage);
  await storage.client.putObject(storage.bucket, objectKey, content, content.length, {
    "Content-Type": mimeType,
  });
  return minioSignedUrl(storage, objectKey);
}

export function getTicketAttachmentUploadTarget(
  environment: ApiEnvironment | undefined,
): CloudinaryUploadTarget | null {
  const cloudName = environment?.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = environment?.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return null;
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    uploadPreset,
    cloudName,
  };
}

export function validateAttachmentFile(
  fileName: string,
  mimeType: string,
  size: number,
): void {
  if (!fileName.trim()) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Attachment file name is required",
    );
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
