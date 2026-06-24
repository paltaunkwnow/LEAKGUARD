import { describe, it, expect } from "vitest";
import { isAuthActionDisabled, assertTermsAccepted } from "../auth-consent";

describe("auth-consent", () => {
  it("disables auth actions when terms are not accepted", () => {
    expect(isAuthActionDisabled(false)).toBe(true);
    expect(isAuthActionDisabled(false, false)).toBe(true);
  });

  it("disables auth actions while loading", () => {
    expect(isAuthActionDisabled(true, true)).toBe(true);
  });

  it("enables auth actions when terms accepted and not loading", () => {
    expect(isAuthActionDisabled(true)).toBe(false);
    expect(isAuthActionDisabled(true, false)).toBe(false);
  });

  it("throws when terms are not accepted", () => {
    expect(() => assertTermsAccepted(false)).toThrow("TERMS_NOT_ACCEPTED");
    expect(() => assertTermsAccepted(true)).not.toThrow();
  });
});
