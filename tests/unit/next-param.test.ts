import { describe, it, expect } from "vitest";
import { sanitizeNext, postAuthDestination } from "@/lib/next-param";

describe("sanitizeNext", () => {
  it("passes ordinary same-origin paths through", () => {
    expect(sanitizeNext("/vce/methods/topics")).toBe("/vce/methods/topics");
    expect(sanitizeNext("/pricing?a=1#x")).toBe("/pricing?a=1#x");
    expect(sanitizeNext("/")).toBe("/");
  });

  it("rejects empty / nullish input", () => {
    expect(sanitizeNext(null)).toBeNull();
    expect(sanitizeNext(undefined)).toBeNull();
    expect(sanitizeNext("")).toBeNull();
  });

  it("rejects open-redirect vectors", () => {
    // protocol-relative
    expect(sanitizeNext("//evil.com")).toBeNull();
    // backslash (URL parsers normalize \ to /)
    expect(sanitizeNext("/\\evil.com")).toBeNull();
    // absolute URL with a scheme
    expect(sanitizeNext("https://evil.com")).toBeNull();
    expect(sanitizeNext("javascript:alert(1)")).toBeNull();
    // relative path without leading slash
    expect(sanitizeNext("evil.com")).toBeNull();
  });

  it("rejects control-char smuggling (tab/newline stripped by URL parsing)", () => {
    // `/%09/evil.com` arrives already percent-decoded from searchParams as a
    // real tab; WHATWG URL parsing would strip it into `//evil.com`.
    expect(sanitizeNext("/\t/evil.com")).toBeNull();
    expect(sanitizeNext("/\n/evil.com")).toBeNull();
    expect(sanitizeNext("/a\rb")).toBeNull();
  });
});

describe("postAuthDestination", () => {
  it("sends returning users to their sanitized next (default /dashboard)", () => {
    expect(postAuthDestination(false, "/pricing")).toBe("/pricing");
    expect(postAuthDestination(false, null)).toBe("/dashboard");
    expect(postAuthDestination(false, "//evil.com")).toBe("/dashboard");
  });

  it("routes first-time users through /welcome carrying next", () => {
    expect(postAuthDestination(true, null)).toBe("/welcome");
    expect(postAuthDestination(true, "/dashboard")).toBe("/welcome");
    expect(postAuthDestination(true, "/vce/methods/exams/2023-exam-1")).toBe(
      "/welcome?next=%2Fvce%2Fmethods%2Fexams%2F2023-exam-1",
    );
    // an unsafe next is dropped, not carried into /welcome
    expect(postAuthDestination(true, "//evil.com")).toBe("/welcome");
  });
});
