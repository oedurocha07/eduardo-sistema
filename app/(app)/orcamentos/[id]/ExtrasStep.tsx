import { StepperField, ToggleField } from "./CamposOrcamento";
import { ItensOrcamentoSection } from "./ItensOrcamentoSection";

type Item = { id: string; nome: string; custoUnitario: number; quantidade: number };
type ItemCatalogo = { id: string; nome: string; categoria: string; unidade: string; precoBase: number };

export function ExtrasStep({
  orcamentoId,
  valores,
  itensOutros,
  catalogoOutros,
}: {
  orcamentoId: string;
  valores: Record<string, number>;
  itensOutros: Item[];
  catalogoOutros: ItemCatalogo[];
}) {
  return (
    <div className="card">
      <h2 className="mb-1 font-semibold text-foreground">Extras</h2>
      <p className="mb-4 text-xs text-muted">Custos operacionais e itens personalizados.</p>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <StepperField orcamentoId={orcamentoId} chave="locucao" label="Locuções" unidade="vídeo" valorInicial={valores["locucao"] ?? 0} />
        <StepperField orcamentoId={orcamentoId} chave="roteiro" label="Roteiros" unidade="vídeo" valorInicial={valores["roteiro"] ?? 0} />
        <StepperField
          orcamentoId={orcamentoId}
          chave="fotografia"
          label="Diárias de fotografia"
          valorInicial={valores["fotografia"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="cobertura-adicional"
          label="Coberturas adicionais"
          valorInicial={valores["cobertura-adicional"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="hospedagem"
          label="Diárias de hospedagem"
          unidade="dias"
          valorInicial={valores["hospedagem"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="alimentacao"
          label="Refeições"
          unidade="pessoa/dia"
          valorInicial={valores["alimentacao"] ?? 0}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleField
          orcamentoId={orcamentoId}
          chave="direcao-criativa"
          label="Direção criativa"
          ativo={(valores["direcao-criativa"] ?? 0) > 0}
        />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="entrega-urgente"
          label="Entrega urgente"
          sublabel="Taxa por priorização"
          ativo={(valores["entrega-urgente"] ?? 0) > 0}
        />
      </div>

      <div className="border-t border-border pt-4">
        <ItensOrcamentoSection
          orcamentoId={orcamentoId}
          itens={itensOutros}
          catalogo={catalogoOutros}
          titulo="Itens personalizados"
          descricao="Escolha outros itens do catálogo (ex: Km rodado) ou adicione um item personalizado."
          permitirAvulso={true}
        />
      </div>
    </div>
  );
}
