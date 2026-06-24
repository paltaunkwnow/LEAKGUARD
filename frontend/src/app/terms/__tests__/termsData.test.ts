import { describe, it, expect } from "vitest";
import { termsData } from "../termsData";
import { Lang } from "@/contexts/language-context";

const LANGS: Lang[] = ["es", "en", "ru", "he"];

const REQUIRED_EN_SNIPPETS = [
  "Computer Fraud and Abuse Act",
  "credential stuffing",
  "AS IS",
  "indemnify",
  "K-Anonymity",
  "State of Delaware",
  "OFAC",
  "does not store, host, mirror",
];

describe("termsData CFAA legal sections", () => {
  it.each(LANGS)("has 10 sections for %s", (lang) => {
    expect(termsData[lang].sections).toHaveLength(10);
  });

  it.each(LANGS)("includes CFAA authorization section for %s", (lang) => {
    const titles = termsData[lang].sections.map((s) => s.title.toLowerCase());
    expect(titles.some((t) => t.includes("cfaa") || t.includes("авториза") || t.includes("הרשאה"))).toBe(true);
  });

  it("includes all critical English legal clauses", () => {
    const enBody = termsData.en.sections.flatMap((s) => s.content).join(" ");
    for (const snippet of REQUIRED_EN_SNIPPETS) {
      expect(enBody.toLowerCase()).toContain(snippet.toLowerCase());
    }
  });

  it("does not claim zero query logging in privacy section", () => {
    for (const lang of LANGS) {
      const privacySection = termsData[lang].sections[8];
      const text = privacySection.content.join(" ").toLowerCase();
      expect(text).not.toMatch(/no almacena los términos de búsqueda/);
      expect(text).not.toMatch(/does not store specific search queries/);
      expect(text).toMatch(/log|registro|журнал|רישום/);
    }
  });
});
