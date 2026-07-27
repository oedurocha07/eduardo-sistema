"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarRange, ChevronDown, ChevronUp, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  createEtapaCronograma,
  deleteEtapaCronograma,
  moveEtapaCronograma,
  updateEtapaCronograma,
  updatePropostaSemCronograma,
} from "../actions";
import { ETAPAS_SUGERIDAS } from "../constants";

type Etapa = { id: string; titulo: string; prazo: string | null };

function EtapaCard({
  propostaId,
  etapa,
  isFirst,
  isLast,
}: {
  propostaId: string;
  etapa: Etapa;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [titulo, setTitulo] = useState(etapa.titulo);
  const [prazo, setPrazo] = useState(etapa.prazo ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => setTitulo(etapa.titulo), [etapa.titulo]);
  useEffect(() => setPrazo(etapa.prazo ?? ""), [etapa.prazo]);

  function salvar() {
    if (!titulo.trim()) return;
    startTransition(() => updateEtapaCronograma(etapa.id, propostaId, titulo, prazo));
  }

  return (
    <div className="group flex items-center gap-1.5 rounded-full border border-border bg-background pl-1.5 pr-3 py-1.5 text-sm">
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          disabled={isPending || isFirst}
          onClick={() => startTransition(() => moveEtapaCronograma(etapa.id, propostaId, "up"))}
          className="text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          disabled={isPending || isLast}
          onClick={() => startTransition(() => moveEtapaCronograma(etapa.id, propostaId, "down"))}
          className="text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronDown size={12} />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvar}
          disabled={isPending}
          className="min-w-0 flex-1 bg-transparent font-medium text-foreground outline-none"
        />
        <input
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
          onBlur={salvar}
          disabled={isPending}
          placeholder="Prazo"
          className="w-16 shrink-0 bg-transparent text-xs text-muted outline-none placeholder:text-muted/60"
        />
      </div>
      <button
        onClick={() => startTransition(() => deleteEtapaCronograma(etapa.id, propostaId))}
        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function SugestaoEtapaChip({ propostaId, titulo }: { propostaId: string; titulo: string }) {
  const [isPending, startTransition] = useTransition();

  function selecionar() {
    const fd = new FormData();
    fd.set("titulo", titulo);
    startTransition(() => createEtapaCronograma(propostaId, fd));
  }

  return (
    <button
      type="button"
      onClick={selecionar}
      disabled={isPending}
      className="flex items-center gap-2 rounded-full border border-dashed border-border bg-background/40 px-4 py-2 text-left text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
    >
      <Plus size={13} className="shrink-0" />
      <span className="truncate">{titulo}</span>
    </button>
  );
}

export function CronogramaSection({
  propostaId,
  etapas,
  semCronograma,
}: {
  propostaId: string;
  etapas: Etapa[];
  semCronograma: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tituloJaExiste = (titulo: string) => etapas.some((e) => e.titulo.trim().toLowerCase() === titulo.trim().toLowerCase());
  const sugestoesRestantes = ETAPAS_SUGERIDAS.filter((t) => !tituloJaExiste(t));

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Cronograma da proposta</h2>
        <p className="text-xs text-muted">Escolha como deseja apresentar as etapas ao cliente.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updatePropostaSemCronograma(propostaId, false))}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
            !semCronograma ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
          }`}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
            <CalendarRange size={16} />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Personalizar depois</div>
            <div className="text-xs text-muted">Cria uma estrutura básica editável.</div>
          </div>
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updatePropostaSemCronograma(propostaId, true))}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
            semCronograma ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
          }`}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted/20 text-muted">
            <EyeOff size={16} />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Sem cronograma</div>
            <div className="text-xs text-muted">Não mostrar esta seção.</div>
          </div>
        </button>
      </div>

      {!semCronograma && (
        <>
          {etapas.length === 0 && sugestoesRestantes.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma etapa definida ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {etapas.map((etapa, i) => (
                <EtapaCard
                  key={etapa.id}
                  propostaId={propostaId}
                  etapa={etapa}
                  isFirst={i === 0}
                  isLast={i === etapas.length - 1}
                />
              ))}
              {sugestoesRestantes.map((titulo) => (
                <SugestaoEtapaChip key={titulo} propostaId={propostaId} titulo={titulo} />
              ))}
            </div>
          )}

          {aberto ? (
            <form
              action={(fd) => {
                startTransition(async () => {
                  await createEtapaCronograma(propostaId, fd);
                  setAberto(false);
                });
              }}
              className="mt-2 flex flex-wrap gap-2"
            >
              <input name="titulo" placeholder="Ex: Captação audiovisual" required className="input flex-1 !py-1 text-xs" autoFocus />
              <input name="prazo" placeholder="Ex: Semana 3" className="input w-32 !py-1 text-xs" />
              <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
                Add
              </button>
            </form>
          ) : (
            <button onClick={() => setAberto(true)} className="mt-2 flex items-center gap-1 text-xs text-accent-hover hover:underline">
              <Plus size={12} /> Criar etapa personalizada
            </button>
          )}
        </>
      )}
    </div>
  );
}
