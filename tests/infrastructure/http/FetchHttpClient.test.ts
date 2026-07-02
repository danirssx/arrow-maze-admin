import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchHttpClient } from "@/infrastructure/http/FetchHttpClient";
import { HttpError } from "@/infrastructure/http/HttpError";

const BASE = "http://api.test";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type FetchCalls = Array<[string, RequestInit]>;

function callInit(fetchMock: ReturnType<typeof vi.fn>, index: number): RequestInit {
  const calls = fetchMock.mock.calls as unknown as FetchCalls;
  return calls[index]![1];
}

function lastCallHeaders(fetchMock: ReturnType<typeof vi.fn>, index: number): Record<string, string> {
  return callInit(fetchMock, index).headers as Record<string, string>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FetchHttpClient", () => {
  it("attaches a Bearer header and returns parsed data with status", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock);
    const client = new FetchHttpClient(BASE, () => "tok");

    const res = await client.get<{ ok: boolean }>("/things");

    expect(res).toEqual({ data: { ok: true }, status: 200 });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/things`, expect.anything());
    expect(lastCallHeaders(fetchMock, 0)["Authorization"]).toBe("Bearer tok");
  });

  it("serializes a JSON body and sets Content-Type on POST", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: 1 }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const client = new FetchHttpClient(BASE);

    await client.post("/things", { name: "x" });

    const init = callInit(fetchMock, 0);
    expect(init.body).toBe(JSON.stringify({ name: "x" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("does not refresh or invalidate on an anonymous 401", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ error: "no" }, 401));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    const tryRefresh = vi.fn();
    const client = new FetchHttpClient(BASE, () => null, onUnauthorized, tryRefresh);

    await expect(client.get("/things")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(tryRefresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes once and retries with the new token on an authed 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock);
    const tryRefresh = vi.fn(async () => "fresh");
    const client = new FetchHttpClient(BASE, () => "stale", vi.fn(), tryRefresh);

    const res = await client.get<{ ok: boolean }>("/things");

    expect(res.data).toEqual({ ok: true });
    expect(tryRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastCallHeaders(fetchMock, 1)["Authorization"]).toBe("Bearer fresh");
  });

  it("invalidates the session when refresh cannot recover the request", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ error: "expired" }, 401));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    const client = new FetchHttpClient(BASE, () => "stale", onUnauthorized, async () => null);

    await expect(client.get("/things")).rejects.toBeInstanceOf(HttpError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
