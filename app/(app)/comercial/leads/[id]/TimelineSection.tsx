"use client";

import { useRef, useTransition } from "react";
import { StickyNote, GitBranch, Thermometer, CalendarClock, Sparkles } from "lucide-react";
import { addNotaLead } from "@/app/(app)/comercial/actions";
import { TipoAtividade } from "@/app/generated/prisma/client";

type Atividade = { id: string; tipo: TipoAtividade; descricao: string; autor: string | null; createdAtISO: string };

const ICONE: Record<TipoAtividade, { icon: typeof StickyNote; cor: string }> = {
  NOTA: { icon: StickyNote, cor: "text-accent-hover" },
  MUDANCA_ETAPA: { icon: GitBranch, cor: "text-blue-400" },
  TEMPERATURA: { icon: Thermometer, cor: "text-warning" },
  PROXIMA_ACAO: { icon: CalendarClock, cor: "text-violet-400" },
  CRIACAO: { icon: Sparkles, cor: "text-success" },
};

export function TimelineSection({ leadId, atividades }: { leadId: string; atividades: Atividade[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form
        ref={formRef}
        action={(fd) => {
          startTransition(async () => {
            await addNotaLead(leadId, fd);
            formRef.current?.reset();
          });
        }}
        className="mb-5 flex gap-2"
      >
        <input name="nota" placeholder="Adicionar uma nota ao histórico…" className="input flex-1" />
        <button type="submit" disabled={isPending} className="btn-primary">
          Adicionar
        </button>
      </form>

      {atividades.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="flex flex-col gap-0">
          {atividades.map((a, i) => {
            const info = ICONE[a.tipo];
            const Icon = info.icon;
            const dt = new Date(a.createdAtISO);
            return (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
                    <Icon size={13} className={info.cor} />
                  </span>
                  {i < atividades.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-5">
                  <div className="text-sm text-foreground">{a.descricao}</div>
                  <div className="text-xs text-muted">
                    {dt.toLocaleDateString("pt-BR")} {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {a.autor && <> · {a.autor}</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
