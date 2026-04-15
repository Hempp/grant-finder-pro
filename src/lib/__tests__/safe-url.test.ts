import { describe, it, expect } from "vitest";
import { assertPublicHttpUrl, SafeUrlError } from "../safe-url";

describe("assertPublicHttpUrl", () => {
  it("accepts public http and https URLs", () => {
    expect(() => assertPublicHttpUrl("https://example.com")).not.toThrow();
    expect(() => assertPublicHttpUrl("http://example.com/path?q=1")).not.toThrow();
  });

  it("rejects non-http protocols (SSRF via file://, gopher://, etc.)", () => {
    expect(() => assertPublicHttpUrl("file:///etc/passwd")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("gopher://example.com")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("ftp://example.com")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("javascript:alert(1)")).toThrow(SafeUrlError);
  });

  it("rejects AWS metadata service (critical cloud SSRF vector)", () => {
    expect(() =>
      assertPublicHttpUrl("http://169.254.169.254/latest/meta-data/iam/security-credentials/")
    ).toThrow(SafeUrlError);
  });

  it("rejects localhost variants", () => {
    expect(() => assertPublicHttpUrl("http://localhost/admin")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://127.0.0.1/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://0.0.0.0/")).toThrow(SafeUrlError);
  });

  it("rejects private RFC1918 IPv4 ranges", () => {
    expect(() => assertPublicHttpUrl("http://10.0.0.1/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://10.255.255.254/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://172.16.0.1/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://172.31.255.254/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://192.168.1.1/")).toThrow(SafeUrlError);
  });

  it("rejects .local and .internal hostnames (mDNS / internal SRE)", () => {
    expect(() => assertPublicHttpUrl("http://host.local")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://service.internal")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://metadata.google.internal")).toThrow(SafeUrlError);
  });

  it("rejects IPv6 loopback and link-local", () => {
    expect(() => assertPublicHttpUrl("http://[::1]/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://[fe80::1]/")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("http://[fc00::1]/")).toThrow(SafeUrlError);
  });

  it("rejects malformed URLs", () => {
    expect(() => assertPublicHttpUrl("not a url at all")).toThrow(SafeUrlError);
    expect(() => assertPublicHttpUrl("")).toThrow(SafeUrlError);
  });

  it("returns the parsed URL object on success", () => {
    const parsed = assertPublicHttpUrl("https://grants.gov/path?x=1");
    expect(parsed.hostname).toBe("grants.gov");
    expect(parsed.pathname).toBe("/path");
  });
});
