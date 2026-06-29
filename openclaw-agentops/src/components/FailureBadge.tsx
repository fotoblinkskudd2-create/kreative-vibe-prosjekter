import type { FailureClass } from "@/lib/types";

const LABEL: Record<FailureClass, string> = {
  none: "ok",
  tool_error: "tool error",
  hallucination: "hallucination",
  timeout: "timeout",
  bad_prompt: "bad prompt",
  missing_context: "missing context",
  cost_spike: "cost spike",
};

export function FailureBadge({ failureClass }: { failureClass: FailureClass }) {
  const color = failureClass === "none" ? "bg-ok/20 text-ok" : "bg-bad/20 text-bad";

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {LABEL[failureClass]}
    </span>
  );
}
