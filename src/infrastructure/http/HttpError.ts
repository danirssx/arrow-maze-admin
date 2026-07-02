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
  ) {
    super(message);
    this.name = "HttpError";
  }

  static fromStatus(status: number, message: string): HttpError {
    return new HttpError(HttpError.mapStatus(status), message, status);
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
