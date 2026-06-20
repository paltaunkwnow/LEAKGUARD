import { describe, it, expect, vi, beforeEach } from "vitest";

describe("api module", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "fake-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("exports api object with expected methods", async () => {
    const { api } = await import("../api");
    expect(api).toBeDefined();
    expect(typeof api.login).toBe("function");
    expect(typeof api.scan).toBe("function");
    expect(typeof api.threats).toBe("function");
    expect(typeof api.dashboardKpis).toBe("function");
    expect(typeof api.demo).toBe("function");
    expect(typeof api.aiAnalyze).toBe("function");
  });

  it("throws on failed request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ detail: "Server error" }),
        })
      )
    );

    const { api } = await import("../api");
    await expect(api.threats()).rejects.toThrow("Server error");
  });
});
