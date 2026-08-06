"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { buscarEnderecoPorCep } from "@/app/lib/cep";

export type Defaults = {
  nome?: string;
  cnpjCpf?: string | null;
  email?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  status?: string;
  recorrente?: boolean;
  valorMensal?: number | string | null;
  diaVencimento?: number | null;
  valorTrabalho?: number | string | null;
  formaPagamento?: string | null;
  descricaoServico?: string | null;
  descricaoNbs?: string | null;
  codigoServicoMunicipal?: string | null;
  codigoTributacaoNacional?: string | null;
  idClienteAsaas?: string | null;
  enviarFaturaLocacao?: boolean;
  observacoes?: string | null;
};

// Códigos usados de verdade nas notas fiscais emitidas pelo Asaas. Texto de tributação
// nacional confirmado na Lista de Serviços anexa à LC 116/2003 (itens 13.03 e 17.06) e
// NBS confirmado na tabela oficial do MDIC (NBSa_2-0.csv).
const SERVICOS_PRESET = [
  {
    label: "Serviços de marketing (17.06.01.001)",
    codigo: "17.06.01.001",
    tributacao:
      "170601 - Propaganda e publicidade, inclusive promoção de vendas, planejamento de campanhas ou sistemas de publicidade, elaboração de desenhos, textos e demais materiais publicitários.",
    nbs: "1.1406.12.00 - Serviços de marketing direto e mala direta",
  },
  {
    label: "Serviços gerais de audiovisual (13.03.01.001)",
    codigo: "13.03.01.001",
    tributacao: "130301 - Fotografia e cinematografia, inclusive revelação, ampliação, cópia, reprodução, trucagem e congêneres.",
    nbs: "1.2501.90.00 - Serviços de produção audiovisual, de apoio e relacionados não classificados em subposições anteriores",
  },
  {
    label: "Cobertura de eventos (13.03.01.002)",
    codigo: "13.03.01.002",
    tributacao: "130301 - Fotografia e cinematografia, inclusive revelação, ampliação, cópia, reprodução, trucagem e congêneres.",
    nbs: "1.2501.90.00 - Serviços de produção audiovisual, de apoio e relacionados não classificados em subposições anteriores",
  },
];

type ItemInput = { item: string; quantidade: string; valorUnitario: string };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
  const [valorTrabalho, setValorTrabalho] = useState(defaults.valorTrabalho?.toString() ?? "");

  const valorTrabalhoNum = Number(valorTrabalho) || 0;
  const capLocacao = valorTrabalhoNum * 0.4;
  const totalItensLocados = itens.reduce((soma, it) => soma + (Number(it.quantidade) || 0) * (Number(it.valorUnitario) || 0), 0);
  const restanteLocacao = capLocacao - totalItensLocados;

  const presetInicial = SERVICOS_PRESET.findIndex((p) => p.codigo === defaults.codigoServicoMunicipal);
  const [presetKey, setPresetKey] = useState(
    presetInicial >= 0 ? String(presetInicial) : defaults.codigoServicoMunicipal || defaults.descricaoNbs ? "outro" : "",
  );
  const [codigo, setCodigo] = useState(defaults.codigoServicoMunicipal ?? "");
  const [tributacao, setTributacao] = useState(defaults.codigoTributacaoNacional ?? "");
  const [nbs, setNbs] = useState(defaults.descricaoNbs ?? "");
  const [diaVencimentoData, setDiaVencimentoData] = useState(() => {
    if (!defaults.diaVencimento) return "";
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), defaults.diaVencimento).toISOString().slice(0, 10);
  });

  const [cep, setCep] = useState(defaults.cep ?? "");
  const [logradouro, setLogradouro] = useState(defaults.logradouro ?? "");
  const [numero, setNumero] = useState(defaults.numero ?? "");
  const [complemento, setComplemento] = useState(defaults.complemento ?? "");
  const [bairro, setBairro] = useState(defaults.bairro ?? "");
  const [cidade, setCidade] = useState(defaults.cidade ?? "");
  const [uf, setUf] = useState(defaults.uf ?? "");
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    const resultado = await buscarEnderecoPorCep(digits);
    setBuscandoCep(false);
    if (resultado) {
      setLogradouro(resultado.logradouro);
      setBairro(resultado.bairro);
      setCidade(resultado.cidade);
      setUf(resultado.uf);
    }
  }

  function selecionarPreset(v: string) {
    setPresetKey(v);
    if (v === "outro" || v === "") return;
    const preset = SERVICOS_PRESET[Number(v)];
    setCodigo(preset.codigo);
    setTributacao(preset.tributacao);
    setNbs(preset.nbs);
  }

  function atualizarItem(i: number, campo: keyof ItemInput, valor: string) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input name="nome" defaultValue={defaults.nome ?? ""} placeholder="Nome do cliente *" required className="input col-span-2" />

      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      <div className="flex items-center gap-2">
        <input
          name="cep"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={handleCepBlur}
          placeholder="CEP"
          className="input"
        />
        {buscandoCep && <Loader2 size={14} className="shrink-0 animate-spin text-muted" />}
      </div>
      <input
        name="bairro"
        value={bairro}
        onChange={(e) => setBairro(e.target.value)}
        placeholder="Bairro"
        className="input"
      />
      <input
        name="logradouro"
        value={logradouro}
        onChange={(e) => setLogradouro(e.target.value)}
        placeholder="Rua / Logradouro"
        className="input col-span-2"
      />
      <input
        name="numero"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        placeholder="Número"
        className="input"
      />
      <input
        name="complemento"
        value={complemento}
        onChange={(e) => setComplemento(e.target.value)}
        placeholder="Complemento"
        className="input"
      />
      <input
        name="cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        placeholder="Cidade"
        className="input"
      />
      <input name="uf" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} placeholder="UF" maxLength={2} className="input" />

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
          <div className="flex flex-col gap-1">
            <input
              type="date"
              value={diaVencimentoData}
              onChange={(e) => setDiaVencimentoData(e.target.value)}
              className="input"
            />
            <input
              type="hidden"
              name="diaVencimento"
              value={diaVencimentoData ? String(new Date(`${diaVencimentoData}T00:00:00`).getDate()) : ""}
            />
            <span className="text-xs text-muted">Só o dia do mês é usado (repete todo mês)</span>
          </div>
        </>
      ) : (
        <>
          <input
            name="valorTrabalho"
            type="number"
            step="0.01"
            value={valorTrabalho}
            onChange={(e) => setValorTrabalho(e.target.value)}
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
        <option value="">Tipo de serviço (código / NBS / tributação)...</option>
        {SERVICOS_PRESET.map((p, i) => (
          <option key={i} value={String(i)}>
            {p.label}
          </option>
        ))}
        <option value="outro">Outro (digitar manualmente)</option>
      </select>
      <input
        name="codigoServicoMunicipal"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código de serviço (ex: 13.03.01.001)"
        className="input"
      />
      <input
        name="codigoTributacaoNacional"
        value={tributacao}
        onChange={(e) => setTributacao(e.target.value)}
        placeholder="Código de tributação nacional"
        className="input col-span-2"
      />
      <input
        name="descricaoNbs"
        value={nbs}
        onChange={(e) => setNbs(e.target.value)}
        placeholder="Código NBS"
        className="input col-span-2"
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
          {!recorrente && valorTrabalhoNum > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Disponível pra locação (40% de {brl(valorTrabalhoNum)})</span>
              <span className={`font-semibold ${restanteLocacao < 0 ? "text-danger" : "text-foreground"}`}>
                {brl(restanteLocacao)}
              </span>
            </div>
          )}
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
