import { LucideIcon } from "lucide-react";

const TONE_STYLES: Record<string, { value: string; icon: string }> = {
  default: { value: "text-foreground", icon: "bg-accent/10 text-accent" },
  success: { value: "text-success", icon: "bg-success/10 text-success" },
  danger: { value: "text-danger", icon: "bg-danger/10 text-danger" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "danger";
}) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.default;

  return (
    <div className="card transition-colors hover:border-accent/30">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted uppercase">{label}</span>
        {Icon && (
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${t.icon}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold ${t.value}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
