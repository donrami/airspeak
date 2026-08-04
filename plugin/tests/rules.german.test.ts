// German rule tests (DIN EN IEC/IEEE 82079-1:2019 + tekom regelbasiert).
import { describe, expect, test } from "bun:test";
import { loadCorpus, runChecks } from "./helpers.ts";

const corpus = loadCorpus();

const MARKERS: Record<string, RegExp> = {
  calque: /\[Denglish\]/,
  passiv: /\[tekom S 501\]/,
  "passiv-modal": /\[tekom S 503\]/,
  compound: /\[tekom B 104-110\]/,
  "sentence-length": /82079-1 minimalism/,
  floskel: /\[tekom L 112\]/,
};

for (const [family, samples] of Object.entries(corpus.de)) {
  describe(`DE check family: ${family}`, () => {
    test("fires on the violating sample", () => {
      const issues = runChecks("de", samples.violating);
      expect(issues.some((i) => MARKERS[family].test(i))).toBe(true);
    });

    test("stays silent on the conforming sample", () => {
      expect(runChecks("de", samples.conforming)).toEqual([]);
    });
  });
}
