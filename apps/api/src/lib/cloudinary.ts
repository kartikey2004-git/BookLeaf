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

export type CloudinaryUploadTarget = {
  uploadUrl: string;
  uploadPreset: string;
  cloudName: string;
};

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
