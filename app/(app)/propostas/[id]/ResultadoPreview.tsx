"use client";

import { Download, Printer } from "lucide-react";
import { PropostaDocumento } from "./PropostaDocumento";

type Item = { id: string; titulo: string; detalhe: string | null };
type Etapa = { id: string; titulo: string; prazo: string | null };

export function ResultadoPreview({
  propostaId,
  titulo,
  clienteNome,
  nomeProdutora,
  logoUrl,
  fraseAbertura,
  contextoProjeto,
  itensEscopo,
  etapas,
  semCronograma,
  valor,
  recorrente,
  parcelamento,
  condicoesPagamento,
  validade,
  numero,
  corDestaque,
}: {
  propostaId: string;
  titulo: string;
  clienteNome: string | null;
  nomeProdutora: string;
  logoUrl: string | null;
  fraseAbertura: string | null;
  contextoProjeto: string | null;
  itensEscopo: Item[];
  etapas: Etapa[];
  semCronograma: boolean;
  valor: number | null;
  recorrente: boolean;
  parcelamento: number | null;
  condicoesPagamento: string | null;
  validade: Date | null;
  numero: string;
  corDestaque: string | null;
}) {
  return (
    <div className="pp-root">
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=chillax@500,600,700&display=swap"
      />

      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <a href={`/propostas/${propostaId}/download`} className="btn-secondary">
          <Download size={16} />
          Baixar HTML
        </a>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} />
          Baixar proposta (PDF)
        </button>
      </div>

      <PropostaDocumento
        titulo={titulo}
        clienteNome={clienteNome}
        nomeProdutora={nomeProdutora}
        logoUrl={logoUrl}
        fraseAbertura={fraseAbertura}
        contextoProjeto={contextoProjeto}
        itensEscopo={itensEscopo}
        etapas={etapas}
        semCronograma={semCronograma}
        valor={valor}
        recorrente={recorrente}
        parcelamento={parcelamento}
        condicoesPagamento={condicoesPagamento}
        validade={validade}
        numero={numero}
        corDestaque={corDestaque}
      />
    </div>
  );
}
