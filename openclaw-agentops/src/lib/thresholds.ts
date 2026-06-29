// Tunable thresholds shared by the classifier and the scorer.
// Kept in one place so behavior is easy to reason about and to re-tune
// once real run data (instead of the demo seed) starts flowing in.
export const THRESHOLDS = {
  TIMEOUT_MS: 120_000,
  SLOW_MS: 60_000,
  COST_SPIKE_USD: 1.0,
  ELEVATED_COST_USD: 0.5,
  BAD_PROMPT_MIN_LENGTH: 20,
};

export const HALLUCINATION_PATTERN =
  /hallucinat|fabricat|made up|made-up|invented (a |an )?fact|incorrect (fact|information|citation)/i;

export const MISSING_CONTEXT_PATTERN =
  /missing context|no context|lack(s|ed)? context|context window|not enough (information|context)|insufficient (information|context)/i;
