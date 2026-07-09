/**
 * Framework-layer environment config. The only place that reads `import.meta.env`.
 */
export interface AppEnv {
  apiBaseUrl: string;
}

export function loadEnv(): AppEnv {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  };
}
