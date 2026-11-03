import { z } from "zod";

export { z };

export const identifierSchema = z.string().min(1).max(255);
export const requestIdSchema = z.string().uuid();
export const urlSchema = z.url();
