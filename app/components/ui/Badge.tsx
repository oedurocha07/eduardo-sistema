const TONES: Record<string, string> = {
  neutral: "bg-surface-hover text-muted border border-border",
  accent: "bg-accent/15 text-accent-hover",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/15 text-warning",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger" | "warning";
}) {
  return <span className={`badge ${TONES[tone]}`}>{children}</span>;
}
