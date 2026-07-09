import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string): string => readFileSync(resolve(root, relativePath), "utf8");

describe("hosting config (AD-11)", () => {
  it("netlify.toml builds to dist with an SPA fallback to index.html", () => {
    const toml = read("netlify.toml");
    expect(toml).toContain('publish = "dist"');
    expect(toml).toContain('command = "npm run build"');
    expect(toml).toMatch(/to\s*=\s*"\/index\.html"/);
    expect(toml).toMatch(/status\s*=\s*200/);
  });

  it("vercel.json outputs dist and rewrites every route to index.html", () => {
    const vercel = JSON.parse(read("vercel.json")) as {
      outputDirectory: string;
      buildCommand: string;
      rewrites: { source: string; destination: string }[];
    };
    expect(vercel.outputDirectory).toBe("dist");
    expect(vercel.buildCommand).toContain("build");
    expect(vercel.rewrites).toContainEqual({ source: "/(.*)", destination: "/index.html" });
  });

  it("public/_redirects provides the Netlify SPA fallback with a 200 status", () => {
    expect(read("public/_redirects")).toMatch(/\/\*\s+\/index\.html\s+200/);
  });

  it(".env.example documents the build-time API base URL", () => {
    expect(read(".env.example")).toContain("VITE_API_BASE_URL");
  });
});
