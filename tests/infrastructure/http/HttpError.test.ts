import { describe, expect, it } from "vitest";
import { HttpError } from "@/infrastructure/http/HttpError";

describe("HttpError.fromResponse", () => {
  it("surfaces the backend error message and code", () => {
    const err = HttpError.fromResponse(422, {
      status: "error",
      error: { code: "BUSINESS_RULE_VIOLATION", message: "Only draft levels can be published" },
    });
    expect(err.message).toBe("Only draft levels can be published");
    expect(err.code).toBe("UNPROCESSABLE");
    expect(err.serverCode).toBe("BUSINESS_RULE_VIOLATION");
    expect(err.status).toBe(422);
  });

  it("falls back to a generic message when the body has no error message", () => {
    const err = HttpError.fromResponse(500, null);
    expect(err.message).toBe("Request failed with status 500");
    expect(err.code).toBe("SERVER_ERROR");
    expect(err.serverCode).toBeUndefined();
  });

  it("ignores a non-object error body", () => {
    const err = HttpError.fromResponse(404, { status: "error", error: "nope" });
    expect(err.message).toBe("Request failed with status 404");
    expect(err.code).toBe("NOT_FOUND");
  });
});
