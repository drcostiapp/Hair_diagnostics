import { EvaluationResult } from "@/lib/types";

const AUTO_FAIL_KEYWORDS = [
  "salesy",
  "discount",
  "wrong fee",
  "chases",
  "over-explains",
  "casual slang",
  "ordinary",
  "reveals internal",
  "pressures"
];

export function enforceCertificationRules(result: EvaluationResult): EvaluationResult {
  const hasAutoFail = result.luxury_violations.some((v) =>
    AUTO_FAIL_KEYWORDS.some((keyword) => v.toLowerCase().includes(keyword))
  );
  const forcedFail = hasAutoFail || result.final_score < 90;
  return {
    ...result,
    pass_fail: forcedFail ? "FAIL" : "PASS"
  };
}
