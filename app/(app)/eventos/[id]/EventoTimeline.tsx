"use client";

import { useState, useTransition } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createAmbiente, createBloco, deleteAmbiente, deleteBloco } from "../actions";

type Bloco = { id: string; titulo: string; inicioMs: number; fimMs: number; responsavel: string | null };
type Ambiente = { id: string; nome: string; cor: string; blocos: Bloco[] };

function fmtHora(ms: number) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export function EventoTimeline({
  eventoId,
  ambientes,
  rangeStartMs,
  rangeEndMs,
  dataBaseISO,
}: {
  eventoId: string;
  ambientes: Ambiente[];
  rangeStartMs: number;
  rangeEndMs: number;
  dataBaseISO: string;
}) {
  const [novoAmbiente, setNovoAmbiente] = useState(false);
  const [blocoAmbiente, setBlocoAmbiente] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const span = Math.max(rangeEndMs - rangeStartMs, 3600000);
  const horas: number[] = [];
  const primeiraHoraMs = Math.ceil(rangeStartMs / 3600000) * 3600000;
  for (let t = primeiraHoraMs; t <= rangeEndMs; t += 3600000) {
    horas.push(t);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Timeline operacional</h2>
          <p className="text-sm text-muted">Ambientes e operações simultâneas ao longo do dia.</p>
        </div>
        <button onClick={() => setNovoAmbiente((v) => !v)} className="btn-secondary">
          <Plus size={15} /> Ambiente
        </button>
      </div>

      {novoAmbiente && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createAmbiente(eventoId, fd);
              setNovoAmbiente(false);
            });
          }}
          className="mb-4 flex gap-2"
        >
          <input name="nome" placeholder="Nome do ambiente (ex: Palco principal)" required className="input max-w-xs" autoFocus />
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar
          </button>
        </form>
      )}

      {ambientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
          Crie um ambiente (ex: Palco principal, Lounge, Bastidores) para montar a timeline.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* régua de horas */}
            <div className="relative mb-2 ml-40 h-5 border-b border-border">
              {horas.map((h) => {
                const left = ((h - rangeStartMs) / span) * 100;
                return (
                  <span key={h} className="absolute -translate-x-1/2 text-[11px] text-muted" style={{ left: `${left}%` }}>
                    {fmtHora(h)}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {ambientes.map((amb) => (
                <div key={amb.id} className="flex items-stretch gap-0">
                  <div className="flex w-40 shrink-0 items-center gap-1.5 pr-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: amb.cor }} />
                    <span className="truncate text-sm font-medium text-foreground">{amb.nome}</span>
                    <button
                      onClick={() => setBlocoAmbiente(blocoAmbiente === amb.id ? null : amb.id)}
                      className="ml-auto text-muted hover:text-accent-hover"
                      title="Adicionar bloco"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => startTransition(() => deleteAmbiente(amb.id, eventoId))}
                      className="text-muted hover:text-danger"
                      title="Remover ambiente"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="relative h-12 flex-1 rounded-lg bg-surface-hover">
                    {horas.map((h) => {
                      const left = ((h - rangeStartMs) / span) * 100;
                      return <div key={h} className="absolute top-0 bottom-0 w-px bg-border/50" style={{ left: `${left}%` }} />;
                    })}
                    {amb.blocos.map((b) => {
                      const left = ((b.inicioMs - rangeStartMs) / span) * 100;
                      const width = ((b.fimMs - b.inicioMs) / span) * 100;
                      return (
                        <div
                          key={b.id}
                          className="group absolute top-1 bottom-1 flex items-center overflow-hidden rounded-md px-2"
                          style={{ left: `${left}%`, width: `${Math.max(width, 4)}%`, backgroundColor: amb.cor + "33", borderLeft: `3px solid ${amb.cor}` }}
                          title={`${b.titulo} · ${fmtHora(b.inicioMs)}–${fmtHora(b.fimMs)}${b.responsavel ? " · " + b.responsavel : ""}`}
                        >
                          <span className="truncate text-[11px] font-medium text-foreground">{b.titulo}</span>
                          <button
                            onClick={() => startTransition(() => deleteBloco(b.id, eventoId))}
                            className="ml-1 hidden shrink-0 text-muted hover:text-danger group-hover:block"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {blocoAmbiente && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await createBloco(eventoId, fd);
              setBlocoAmbiente(null);
            });
          }}
          className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
        >
          <input type="hidden" name="ambienteId" value={blocoAmbiente} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Bloco</label>
            <input name="titulo" placeholder="Ex: Abertura" required className="input" autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Início</label>
            <input name="inicio" type="datetime-local" required defaultValue={`${dataBaseISO}T09:00`} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Fim</label>
            <input name="fim" type="datetime-local" required defaultValue={`${dataBaseISO}T10:00`} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Responsável</label>
            <input name="responsavel" placeholder="Opcional" className="input" />
          </div>
          <button type="submit" disabled={isPending} className="btn-primary">
            Adicionar bloco
          </button>
          <button type="button" onClick={() => setBlocoAmbiente(null)} className="btn-ghost">
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
