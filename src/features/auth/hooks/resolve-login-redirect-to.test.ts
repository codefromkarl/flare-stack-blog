import { describe, expect, it } from "vitest";
import { resolveLoginRedirectTo } from "./resolve-login-redirect-to";

describe("resolveLoginRedirectTo", () => {
  it("returns explicit redirectTo when provided", () => {
    const result = resolveLoginRedirectTo({
      redirectTo: "/admin",
      locationSearch: "?client_id=abc&response_type=code",
    });

    expect(result).toBe("/admin");
  });

  it("returns oauth consent redirect when oauth params are present", () => {
    const result = resolveLoginRedirectTo({
      locationSearch:
        "?client_id=my-client&response_type=code&scope=read:user&state=test",
    });

    expect(result).toBe(
      "/oauth/consent?client_id=my-client&response_type=code&scope=read%3Auser&state=test",
    );
  });

  it("supports structured router search objects", () => {
    const result = resolveLoginRedirectTo({
      locationSearch: {
        client_id: "my-client",
        response_type: "code",
        scope: "read:user",
        state: "test",
      },
    });

    expect(result).toBe(
      "/oauth/consent?client_id=my-client&response_type=code&scope=read%3Auser&state=test",
    );
  });

  it("returns undefined when oauth params are incomplete", () => {
    const result = resolveLoginRedirectTo({
      locationSearch: "?client_id=my-client",
    });

    expect(result).toBeUndefined();
  });
});
