import { describe, expect, it } from "vitest";
import { normalizeRedirectUrl } from "./normalize-redirect-url";

describe("normalizeRedirectUrl", () => {
  it("does not access window during server-side rendering", () => {
    expect(() => normalizeRedirectUrl(undefined, "/")).not.toThrow();
    expect(normalizeRedirectUrl(undefined, "/")).toBe("/");
  });

  it("keeps relative redirect targets", () => {
    expect(normalizeRedirectUrl("/oauth/consent?client_id=abc", "/")).toBe(
      "/oauth/consent?client_id=abc",
    );
  });
});
