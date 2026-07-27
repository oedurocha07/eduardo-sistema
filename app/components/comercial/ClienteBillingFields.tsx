"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type Defaults = {
  nome?: string;
  cnpjCpf?: string | null;
  email?: string | null;
  endereco?: string | null;
  status?: string;
  recorrente?: boolean;
  valorMensal?: number | string | null;
  diaVencimento?: number | null;
  valorTrabalho?: number | string | null;
  formaPagamento?: string | null;
  descricaoServico?: string | null;
  descricaoNbs?: string | null;
  codigoServicoMunicipal?: string | null;
  idClienteAsaas?: string | null;
  enviarFaturaLocacao?: boolean;
  observacoes?: string | null;
};

const SERVICOS_PRESET = [
  { codigo: "13.03.01 - Produção audiovisual", nbs: "Serviço de produção audiovisual" },
  { codigo: "17.06.01 - Marketing direto", nbs: "Marketing direto" },
];

type ItemInput = { item: string; quantidade: string; valorUnitario: string };

export function ClienteBillingFields({
  defaults = {},
  mostrarItensLocados = true,
}: {
  defaults?: Defaults;
  mostrarItensLocados?: boolean;
}) {
  const [recorrente, setRecorrente] = useState(defaults.recorrente ?? true);
  const [enviarFatura, setEnviarFatura] = useState(defaults.enviarFaturaLocacao ?? false);
  const [itens, setItens] = useState<ItemInput[]>([{ item: "", quantidade: "1", valorUnitario: "" }]);

  const presetInicial = SERVICOS_PRESET.findIndex(
    (p) => p.codigo === defaults.codigoServicoMunicipal && p.nbs === defaults.descricaoNbs,
  );
  const [presetKey, setPresetKey] = useState(
    presetInicial >= 0 ? String(presetInicial) : defaults.codigoServicoMunicipal || defaults.descricaoNbs ? "outro" : "",
  );
  const [codigo, setCodigo] = useState(defaults.codigoServicoMunicipal ?? "");
  const [nbs, setNbs] = useState(defaults.descricaoNbs ?? "");

  function selecionarPreset(v: string) {
    setPresetKey(v);
    if (v === "outro" || v === "") return;
    const preset = SERVICOS_PRESET[Number(v)];
    setCodigo(preset.codigo);
    setNbs(preset.nbs);
  }

  function atualizarItem(i: number, campo: keyof ItemInput, valor: string) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <input name="nome" defaultValue={defaults.nome ?? ""} placeholder="Nome do cliente *" required className="input col-span-2" />

      <div className="col-span-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRecorrente(true)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            recorrente ? "border-accent bg-accent/10 text-accent-hover" : "border-border text-muted hover:border-accent/50"
          }`}
        >
          Cliente Recorrente
        </button>
        <button
          type="button"
          onClick={() => setRecorrente(false)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            !recorrente ? "border-accent bg-accent/10 text-accent-hover" : "border-border text-muted hover:border-accent/50"
          }`}
        >
          Cliente Freela
        </button>
      </div>
      <input type="hidden" name="recorrente" value={recorrente ? "on" : ""} />

      <input name="email" defaultValue={defaults.email ?? ""} placeholder="E-mail" className="input" />
      <input name="cnpjCpf" defaultValue={defaults.cnpjCpf ?? ""} placeholder="CNPJ/CPF" className="input" />
      <input name="endereco" defaultValue={defaults.endereco ?? ""} placeholder="Endereço/CEP" className="input col-span-2" />

      <select name="status" defaultValue={defaults.status ?? "ATIVO"} className="input">
        <option value="ATIVO">Ativo</option>
        <option value="PAUSADO">Pausado</option>
        <option value="ENCERRADO">Encerrado</option>
      </select>

      {recorrente ? (
        <>
          <input
            name="valorMensal"
            type="number"
            step="0.01"
            defaultValue={defaults.valorMensal?.toString() ?? ""}
            placeholder="Valor mensal"
            className="input"
          />
          <input
            name="diaVencimento"
            type="number"
            min={1}
            max={31}
            defaultValue={defaults.diaVencimento ?? ""}
            placeholder="Dia de vencimento"
            className="input"
          />
        </>
      ) : (
        <>
          <input
            name="valorTrabalho"
            type="number"
            step="0.01"
            defaultValue={defaults.valorTrabalho?.toString() ?? ""}
            placeholder="Valor do trabalho"
            className="input"
          />
          <input
            name="formaPagamento"
            defaultValue={defaults.formaPagamento ?? ""}
            placeholder="Forma de pagamento (ex: à vista, 50/50, PIX)"
            className="input"
          />
        </>
      )}

      {defaults.idClienteAsaas && (
        <p className="col-span-2 text-xs text-muted">
          ID no Asaas: <span className="font-mono">{defaults.idClienteAsaas}</span> (criado automaticamente)
        </p>
      )}

      <select value={presetKey} onChange={(e) => selecionarPreset(e.target.value)} className="input col-span-2">
        <option value="">Tipo de serviço (NBS / código municipal)...</option>
        {SERVICOS_PRESET.map((p, i) => (
          <option key={i} value={String(i)}>
            {p.codigo}
          </option>
        ))}
        <option value="outro">Outro (digitar manualmente)</option>
      </select>
      {presetKey === "outro" ? (
        <>
          <input
            name="codigoServicoMunicipal"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código serviço municipal"
            className="input"
          />
          <input name="descricaoNbs" value={nbs} onChange={(e) => setNbs(e.target.value)} placeholder="Descrição NBS" className="input" />
        </>
      ) : (
        <>
          <input type="hidden" name="codigoServicoMunicipal" value={codigo} />
          <input type="hidden" name="descricaoNbs" value={nbs} />
        </>
      )}

      <textarea
        name="descricaoServico"
        defaultValue={defaults.descricaoServico ?? ""}
        placeholder="Descrição do serviço prestado"
        className="input col-span-2"
        rows={3}
      />
      <textarea
        name="observacoes"
        defaultValue={defaults.observacoes ?? ""}
        placeholder="Observações"
        className="input col-span-2"
        rows={2}
      />

      <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={enviarFatura}
          onChange={(e) => setEnviarFatura(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        <input type="hidden" name="enviarFaturaLocacao" value={enviarFatura ? "on" : ""} />
        Enviar fatura de locação (60/40)
      </label>

      {enviarFatura && mostrarItensLocados && (
        <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-border p-3">
          <span className="text-xs font-medium text-muted uppercase">Itens locados</span>
          {itens.map((it, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={it.item}
                onChange={(e) => atualizarItem(i, "item", e.target.value)}
                placeholder="Item"
                className="input flex-1 !py-1 text-xs"
              />
              <input
                value={it.quantidade}
                onChange={(e) => atualizarItem(i, "quantidade", e.target.value)}
                type="number"
                min={1}
                placeholder="Qtd"
                className="input w-16 !py-1 text-xs"
              />
              <input
                value={it.valorUnitario}
                onChange={(e) => atualizarItem(i, "valorUnitario", e.target.value)}
                type="number"
                step="0.01"
                placeholder="Valor unit."
                className="input w-28 !py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => setItens((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 text-muted hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItens((prev) => [...prev, { item: "", quantidade: "1", valorUnitario: "" }])}
            className="flex w-fit items-center gap-1 text-xs text-accent-hover hover:underline"
          >
            <Plus size={12} /> Adicionar item
          </button>
          <input
            type="hidden"
            name="itensLocadosJson"
            value={JSON.stringify(itens.filter((i) => i.item.trim()))}
          />
        </div>
      )}
    </div>
  );
}
