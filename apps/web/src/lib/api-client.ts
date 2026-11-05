const DEFAULT_API_URL = "http://localhost:4000";

function apiBaseUrl(): string {
  // Browser traffic is routed through the same-origin Next.js proxy so Better
  // Auth cookies are owned by the Vercel origin and SSE remains authenticated.
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function apiErrorMessage(status: number, code?: string): string {
  switch (code) {
    case "AI_UNAVAILABLE":
      return "AI drafting is temporarily unavailable. Please try again shortly.";
    case "TICKET_VERSION_CONFLICT":
      return "This ticket changed while you were working. Refresh it and try again.";
    case "VALIDATION_ERROR":
      return "Please check the information and try again.";
    case "NOT_FOUND":
      return "We couldn’t find that item.";
    case "UNAUTHENTICATED":
    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again.";
    case "FORBIDDEN":
      return "You don’t have permission to do that.";
    case "RATE_LIMITED":
    case "RATE_LIMIT_EXCEEDED":
      return "You’ve tried that too many times. Please wait a moment and try again.";
    case "API_UNAVAILABLE":
    case "API_PROXY_UNAVAILABLE":
      return "The service is temporarily unavailable. Please try again shortly.";
  }

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "We couldn’t find that item.";
  if (status === 409)
    return "This item changed while you were working. Refresh and try again.";
  if (status === 429)
    return "You’ve tried that too many times. Please wait a moment and try again.";
  if (status >= 500)
    return "The service is temporarily unavailable. Please try again shortly.";
  if (status >= 400) return "Please check your information and try again.";
  return "Something went wrong. Please try again.";
}

export function userFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof TypeError && /fetch|network/i.test(error.message))
    return "Couldn’t connect to the service. Check your connection and try again.";
  return fallback;
}

export function signInErrorMessage(message?: string | null): string {
  const normalized = message?.toLowerCase() ?? "";
  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("incorrect password")
  ) {
    return "That email and password don’t match. Please try again.";
  }
  if (normalized.includes("too many") || normalized.includes("rate limit")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }
  return "Could not sign in. Check your email and password, then try again.";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | { error?: { code?: string; message?: string; requestId?: string } }
      | undefined;
    throw new ApiClientError(
      apiErrorMessage(response.status, body?.error?.code),
      response.status,
      body?.error?.requestId ??
        response.headers.get("x-request-id") ??
        undefined,
    );
  }

  return response.json() as Promise<T>;
}
