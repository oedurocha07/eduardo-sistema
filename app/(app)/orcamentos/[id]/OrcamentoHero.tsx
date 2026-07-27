import { Sparkles } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { Badge } from "@/app/components/ui/Badge";

export function OrcamentoHero({
  categoria,
  nome,
  clienteNome,
  responsavel,
  isTemplate,
  custoOperacional,
  margemPercentual,
  precoSugerido,
  lucroEstimado,
}: {
  categoria: string;
  nome: string;
  clienteNome: string | null;
  responsavel: string | null;
  isTemplate: boolean;
  custoOperacional: number;
  margemPercentual: number;
  precoSugerido: number;
  lucroEstimado: number;
}) {
  return (
    <div className="hero-glow mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent uppercase">
          <Sparkles size={12} />
          {categoria}
        </div>
        {isTemplate && <Badge tone="accent">Template</Badge>}
      </div>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{nome}</h1>
      {(clienteNome || responsavel) && (
        <p className="mt-1 text-sm text-muted">
          {clienteNome ?? "Sem cliente vinculado"}
          {responsavel && <> · Responsável: {responsavel}</>}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Custo operacional</div>
          <div className="text-lg font-bold text-foreground">
            <Money value={custoOperacional} />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Margem</div>
          <div className="text-lg font-bold text-foreground">{margemPercentual}%</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Preço sugerido</div>
          <div className="text-lg font-bold text-accent-hover">
            <Money value={precoSugerido} />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Lucro estimado</div>
          <div className="text-lg font-bold text-success">
            <Money value={lucroEstimado} />
          </div>
        </div>
      </div>
    </div>
  );
}
