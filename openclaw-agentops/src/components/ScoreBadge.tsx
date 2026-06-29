export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-ok/20 text-ok" : score >= 50 ? "bg-warn/20 text-warn" : "bg-bad/20 text-bad";

  return (
    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-mono font-semibold ${color}`}>
      {score}
    </span>
  );
}
