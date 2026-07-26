"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type ItemLocado = { id?: string; item: string; quantidade: number; valorUnitario: number };

type Defaults = {
  nome?: string;
  cnpjCpf?: string | null;
  email?: string | null;
  endereco?: string | null;
  status?: string;
  valorMensal?: number | string | null;
  diaVencimento?: number | null;
  descricaoServico?: string | null;
  descricaoNbs?: string | null;
  codigoServicoMunicipal?: string | null;
  idClienteAsaas?: string | null;
  enviarFaturaLocacao?: boolean;
  observacoes?: string | null;
  itensLocados?: ItemLocado[];
};

export function ClienteFormFields({ defaults = {} }: { defaults?: Defaults }) {
  const [faturaLocacao, setFaturaLocacao] = useState(defaults.enviarFaturaLocacao ?? false);
  const [itens, setItens] = useState<ItemLocado[]>(defaults.itensLocados ?? []);

  function atualizarItem(index: number, campo: keyof ItemLocado, valor: string) {
    setItens((atual) =>
      atual.map((it, i) =>
        i === index
          ? {
              ...it,
              [campo]: campo === "item" ? valor : Number(valor),
            }
          : it
      )
    );
  }

  function removerItem(index: number) {
    setItens((atual) => atual.filter((_, i) => i !== index));
  }

  function adicionarItem() {
    setItens((atual) => [...atual, { item: "", quantidade: 1, valorUnitario: 0 }]);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <input name="nome" defaultValue={defaults.nome ?? ""} placeholder="Nome do cliente *" required className="input col-span-2" />
      <input name="email" defaultValue={defaults.email ?? ""} placeholder="E-mail" className="input" />
      <input name="cnpjCpf" defaultValue={defaults.cnpjCpf ?? ""} placeholder="CNPJ/CPF" className="input" />
      <input name="endereco" defaultValue={defaults.endereco ?? ""} placeholder="Endereço/CEP" className="input" />
      <select name="status" defaultValue={defaults.status ?? "ATIVO"} className="input">
        <option value="ATIVO">Ativo</option>
        <option value="PAUSADO">Pausado</option>
        <option value="ENCERRADO">Encerrado</option>
      </select>
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
      <input
        name="idClienteAsaas"
        defaultValue={defaults.idClienteAsaas ?? ""}
        placeholder="ID Cliente Asaas"
        className="input"
      />
      <input
        name="descricaoNbs"
        defaultValue={defaults.descricaoNbs ?? ""}
        placeholder="Descrição NBS"
        className="input"
      />
      <input
        name="codigoServicoMunicipal"
        defaultValue={defaults.codigoServicoMunicipal ?? ""}
        placeholder="Código serviço municipal"
        className="input"
      />
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
          name="enviarFaturaLocacao"
          type="checkbox"
          checked={faturaLocacao}
          onChange={(e) => setFaturaLocacao(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Enviar fatura de locação (60/40)
      </label>

      {faturaLocacao && (
        <div className="col-span-2 rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase">Itens locados</span>
            <button type="button" onClick={adicionarItem} className="flex items-center gap-1 text-xs text-accent-hover hover:underline">
              <Plus size={12} /> item
            </button>
          </div>

          {itens.length === 0 ? (
            <p className="text-xs text-muted">Nenhum item ainda. Clique em “+ item” para adicionar.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {itens.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={it.item}
                    onChange={(e) => atualizarItem(i, "item", e.target.value)}
                    placeholder="Item"
                    className="input flex-1 !py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={it.quantidade}
                    onChange={(e) => atualizarItem(i, "quantidade", e.target.value)}
                    min={1}
                    placeholder="Qtd"
                    className="input w-16 !py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={it.valorUnitario}
                    onChange={(e) => atualizarItem(i, "valorUnitario", e.target.value)}
                    placeholder="Valor un."
                    className="input w-24 !py-1.5 text-xs"
                  />
                  <button type="button" onClick={() => removerItem(i)} className="text-muted hover:text-danger">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="hidden" name="itensLocadosJson" value={JSON.stringify(itens.filter((it) => it.item.trim()))} />
        </div>
      )}
    </div>
  );
}
