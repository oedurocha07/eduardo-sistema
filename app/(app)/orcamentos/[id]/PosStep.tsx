import { StepperField, ToggleField } from "./CamposOrcamento";
import { ItensOrcamentoSection } from "./ItensOrcamentoSection";

type Item = { id: string; nome: string; custoUnitario: number; quantidade: number };
type ItemCatalogo = { id: string; nome: string; categoria: string; unidade: string; precoBase: number };

export function PosStep({
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
      <h2 className="mb-1 font-semibold text-foreground">Pós-produção</h2>
      <p className="mb-4 text-xs text-muted">Edição, motion e entregas finais.</p>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <StepperField
          orcamentoId={orcamentoId}
          chave="video-entregue"
          label="Vídeos entregues"
          valorInicial={valores["video-entregue"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="short-reel"
          label="Shorts / Reels"
          valorInicial={valores["short-reel"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="hora-motion"
          label="Horas de Motion"
          unidade="h"
          valorInicial={valores["hora-motion"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="hora-color-grading"
          label="Horas de Color Grading"
          unidade="h"
          valorInicial={valores["hora-color-grading"] ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleField orcamentoId={orcamentoId} chave="legendagem" label="Legendagem" ativo={(valores["legendagem"] ?? 0) > 0} />
        <ToggleField orcamentoId={orcamentoId} chave="thumbnail" label="Thumbnail" ativo={(valores["thumbnail"] ?? 0) > 0} />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="versao-horizontal"
          label="Versão horizontal (16:9)"
          ativo={(valores["versao-horizontal"] ?? 0) > 0}
        />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="versao-vertical"
          label="Versão vertical (9:16)"
          ativo={(valores["versao-vertical"] ?? 0) > 0}
        />
      </div>

      {(itensOutros.length > 0 || catalogoOutros.length > 0) && (
        <div className="mt-4 border-t border-border pt-4">
          <ItensOrcamentoSection
            orcamentoId={orcamentoId}
            itens={itensOutros}
            catalogo={catalogoOutros}
            titulo="Outros itens de pós-produção"
            descricao="Ex: Edição simples/complexa, After Movie — itens do catálogo sem campo fixo acima."
            permitirAvulso={false}
          />
        </div>
      )}
    </div>
  );
}
