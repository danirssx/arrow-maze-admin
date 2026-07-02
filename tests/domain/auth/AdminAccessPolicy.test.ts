import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/domain/auth/AdminAccessPolicy";

describe("isAdminRole", () => {
  it("is true only for the ADMIN role", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
  });

  it("is false for a regular USER role", () => {
    expect(isAdminRole("USER")).toBe(false);
  });
});
