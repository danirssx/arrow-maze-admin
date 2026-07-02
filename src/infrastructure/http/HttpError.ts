export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class HttpError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly status?: number,
    /** The backend's domain error code (e.g. `BUSINESS_RULE_VIOLATION`), when present. */
    readonly serverCode?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static fromStatus(status: number, message: string): HttpError {
    return new HttpError(HttpError.mapStatus(status), message, status);
  }

  /**
   * Builds an error from a failed response body. The backend wraps failures as
   * `{ status:"error", error:{ code, message } }`; when that message is present it is
   * surfaced verbatim so the UI can show it (e.g. "Only draft levels can be published").
   */
  static fromResponse(status: number, body: unknown): HttpError {
    const parsed = HttpError.extractError(body);
    const message = parsed?.message ?? `Request failed with status ${status}`;
    return new HttpError(HttpError.mapStatus(status), message, status, parsed?.code);
  }

  private static extractError(
    body: unknown,
  ): { code: string | undefined; message: string | undefined } | null {
    if (typeof body !== "object" || body === null || !("error" in body)) return null;
    const error = (body as { error: unknown }).error;
    if (typeof error !== "object" || error === null) return null;
    const record = error as Record<string, unknown>;
    const code = typeof record["code"] === "string" ? (record["code"] as string) : undefined;
    const message = typeof record["message"] === "string" ? (record["message"] as string) : undefined;
    return { code, message };
  }

  private static mapStatus(status: number): AppErrorCode {
    if (status === 400) return "BAD_REQUEST";
    if (status === 401) return "UNAUTHORIZED";
    if (status === 403) return "FORBIDDEN";
    if (status === 404) return "NOT_FOUND";
    if (status === 409) return "CONFLICT";
    if (status === 422) return "UNPROCESSABLE";
    if (status >= 500) return "SERVER_ERROR";
    return "UNKNOWN";
  }
}
