const DEFAULT_API_URL = "http://localhost:4000";

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
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
      body?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.error?.requestId ??
        response.headers.get("x-request-id") ??
        undefined,
      body?.error?.code,
    );
  }

  return response.json() as Promise<T>;
}
