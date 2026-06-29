import type { FailureClass } from "./types";

const RECOMMENDATIONS: Record<FailureClass, string> = {
  tool_error:
    "Add explicit tool-call validation and a retry-with-backoff wrapper before trusting tool output.",
  hallucination:
    "Add a verification step that requires the agent to cite the exact file/line or source before accepting a claim.",
  timeout:
    "Break the task into smaller checkpointed steps and set an explicit time-box per step.",
  bad_prompt:
    "Rewrite the prompt to include an explicit goal, constraints, and the expected output fields.",
  missing_context:
    "Inject the relevant memory/context files into the prompt before the run starts.",
  cost_spike:
    "Cap max tokens, trim unused context, or split the task into smaller batched calls.",
  none: "No action needed. Keep this prompt/run as a reference example for future agents.",
};

export function recommendFor(failureClass: FailureClass): string {
  return RECOMMENDATIONS[failureClass];
}

export function rewritePrompt(original: string, failureClass: FailureClass): string {
  const trimmed = original.trim();

  switch (failureClass) {
    case "bad_prompt":
      return [
        `Goal: ${trimmed || "<describe the concrete outcome>"}`,
        "Context: <add relevant files/background>",
        "Constraints: <add limits, format, stack>",
        "Expected output: <describe the exact deliverable>",
      ].join("\n");
    case "missing_context":
      return [
        trimmed,
        "",
        "Context:",
        "- <paste relevant file paths/snippets>",
        "- <paste prior decisions/memory relevant to this task>",
      ].join("\n");
    case "hallucination":
      return [
        trimmed,
        "",
        'Before answering, verify every fact against the provided source/files and cite the file:line for each claim. If unsure, say "unknown" instead of guessing.',
      ].join("\n");
    case "timeout":
      return [
        trimmed,
        "",
        "Work in small checkpointed steps. After each step, report progress before continuing.",
      ].join("\n");
    case "cost_spike":
      return [
        trimmed,
        "",
        "Keep responses and tool output concise. Avoid re-reading unchanged files. Stay within a strict token budget.",
      ].join("\n");
    default:
      return trimmed;
  }
}
