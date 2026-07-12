/**
 * Framework-layer environment config. The only place that reads `import.meta.env`.
 */
export interface AppEnv {
  apiBaseUrl: string;
}

export const LOCAL_API_BASE_URL = "http://localhost:3000";
export const PRODUCTION_API_BASE_URL = "https://arrow-maze-backend-production-6dd8.up.railway.app";

type ViteRuntimeEnv = Pick<ImportMetaEnv, "PROD" | "VITE_API_BASE_URL">;

export function resolveApiBaseUrl(env: ViteRuntimeEnv = import.meta.env): string {
  const configured = env.VITE_API_BASE_URL?.trim();
  if (configured !== undefined && configured.length > 0) {
    if (env.PROD && isLocalhostUrl(configured)) {
      return PRODUCTION_API_BASE_URL;
    }
    return configured;
  }
  return env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL;
}

export function loadEnv(): AppEnv {
  return {
    apiBaseUrl: resolveApiBaseUrl(),
  };
}

function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
