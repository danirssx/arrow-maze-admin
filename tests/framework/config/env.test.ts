import {
  LOCAL_API_BASE_URL,
  PRODUCTION_API_BASE_URL,
  resolveApiBaseUrl,
} from "@/framework/config/env";

describe("admin environment config", () => {
  it("uses the configured VITE_API_BASE_URL when present", () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: "https://api.example.com" })).toBe(
      "https://api.example.com"
    );
  });

  it("falls back to the local backend outside production", () => {
    expect(resolveApiBaseUrl({ PROD: false })).toBe(LOCAL_API_BASE_URL);
  });

  it("falls back to the production backend in production builds", () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: "   " })).toBe(PRODUCTION_API_BASE_URL);
  });

  it("does not allow localhost as the production backend", () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: "http://localhost:3000" })).toBe(
      PRODUCTION_API_BASE_URL
    );
  });
});
