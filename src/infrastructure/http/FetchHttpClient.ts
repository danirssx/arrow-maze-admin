// Pattern: Adapter
import type { HttpRequestConfig, HttpResponse, IHttpClient } from "@/application/ports/IHttpClient";
import { HttpError } from "./HttpError";

/** Supplies the current access token (or null) for the request interceptor. */
export type AuthTokenProvider = () => string | null;
/** Attempts to refresh the access token; resolves to the new token, or null. */
export type RefreshHandler = () => Promise<string | null>;
/** Called when an authed request stays 401 after refresh, so the session can be cleared. */
export type UnauthorizedHandler = () => void | Promise<void>;

type Method = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Fetch-based HTTP client with a Bearer interceptor and 401 refresh-and-retry (mirrors
 * the mobile client's Axios adapter, MAZ-187): on a 401 for a request that carried an
 * Authorization header, refresh once and retry with the new token; if refresh fails,
 * invalidate the session. Anonymous 401s never loop.
 */
export class FetchHttpClient implements IHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenProvider?: AuthTokenProvider,
    private readonly onUnauthorized?: UnauthorizedHandler,
    private readonly tryRefresh?: RefreshHandler,
  ) {}

  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, config);
  }
  post<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, body, config);
  }
  put<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, body, config);
  }
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  private async request<T>(
    method: Method,
    url: string,
    body: unknown,
    config?: HttpRequestConfig,
    retried = false,
  ): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = { ...(config?.headers ?? {}) };
    const hasExplicitAuth = "Authorization" in headers || "authorization" in headers;
    if (body !== undefined && headers["Content-Type"] === undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (!hasExplicitAuth) {
      const token = this.tokenProvider?.() ?? null;
      if (token !== null && token !== "") {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    const sentAuth = headers["Authorization"] !== undefined || headers["authorization"] !== undefined;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(url, config?.params), {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (err) {
      throw new HttpError("NETWORK_ERROR", err instanceof Error ? err.message : "Network error");
    }

    if (response.status === 401 && sentAuth) {
      if (!retried && this.tryRefresh !== undefined) {
        const newToken = await this.tryRefresh();
        if (newToken !== null && newToken !== "") {
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          return this.request<T>(method, url, body, { ...config, headers: retryHeaders }, true);
        }
      }
      if (this.onUnauthorized !== undefined) await this.onUnauthorized();
    }

    if (!response.ok) {
      throw HttpError.fromStatus(response.status, `Request failed with status ${response.status}`);
    }
    return { data: (await this.parseBody(response)) as T, status: response.status };
  }

  private buildUrl(url: string, params?: HttpRequestConfig["params"]): string {
    const full = `${this.baseUrl}${url}`;
    if (params === undefined) return full;
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) search.append(key, String(value));
    const query = search.toString();
    if (query === "") return full;
    return `${full}${full.includes("?") ? "&" : "?"}${query}`;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    return text === "" ? null : JSON.parse(text);
  }
}
