// Parity test (SC-002): the packaged checks MUST produce the exact issue
// lists captured in baseline.json before any behavior changes were made.
// Any rule drift breaks this test.
import { describe, expect, test } from "bun:test";
import { loadBaseline, loadCorpus, runChecks } from "./helpers.ts";

const baseline = loadBaseline();
const corpus = loadCorpus();

for (const lang of ["en", "de"] as const) {
  describe(`parity: ${lang}`, () => {
    for (const family of Object.keys(corpus[lang])) {
      test(`${family} matches the baseline exactly`, () => {
        const samples = corpus[lang][family];
        expect(runChecks(lang, samples.violating)).toEqual(baseline[lang][family].violating);
        expect(runChecks(lang, samples.conforming)).toEqual(baseline[lang][family].conforming);
      });
    }
  });
}
