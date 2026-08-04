import { Sparkles } from "lucide-react";
import { Money } from "@/app/components/ui/Money";
import { PropostaStatusSelect } from "../PropostaStatusSelect";
import { DeletePropostaButton } from "../DeletePropostaButton";
import { StatusProposta } from "@/app/generated/prisma/client";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "UTC" });

export function PropostaHero({
  propostaId,
  numero,
  titulo,
  clienteNome,
  status,
  itensEscopoCount,
  valor,
  recorrente,
  validade,
}: {
  propostaId: string;
  numero: string;
  titulo: string;
  clienteNome: string | null;
  status: StatusProposta;
  itensEscopoCount: number;
  valor: number | null;
  recorrente: boolean;
  validade: Date | null;
}) {
  return (
    <div className="hero-glow mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent uppercase">
            <Sparkles size={12} />
            {numero}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{titulo}</h1>
          {clienteNome && <p className="mt-1 text-sm text-muted">{clienteNome}</p>}
        </div>
        <div className="flex items-center gap-2">
          <PropostaStatusSelect id={propostaId} status={status} />
          <DeletePropostaButton id={propostaId} titulo={titulo} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Investimento</div>
          <div className="text-lg font-bold text-accent-hover">{valor != null ? brl(valor) : "—"}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Formato</div>
          <div className="text-lg font-bold text-foreground">{recorrente ? "Recorrente" : "Fechado"}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Itens no escopo</div>
          <div className="text-lg font-bold text-foreground">{itensEscopoCount || "—"}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted uppercase">Validade</div>
          <div className="text-lg font-bold text-foreground">{validade ? dataBR(validade) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
