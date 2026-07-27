import { StepperField, ToggleField } from "./CamposOrcamento";
import { ItensOrcamentoSection } from "./ItensOrcamentoSection";

type Item = { id: string; nome: string; custoUnitario: number; quantidade: number };
type ItemCatalogo = { id: string; nome: string; categoria: string; unidade: string; precoBase: number };

export function ProducaoStep({
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
      <h2 className="mb-1 font-semibold text-foreground">Produção</h2>
      <p className="mb-4 text-xs text-muted">Equipe e equipamento em campo.</p>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <StepperField
          orcamentoId={orcamentoId}
          chave="diaria-captacao"
          label="Diárias de captação"
          unidade="dias"
          valorInicial={valores["diaria-captacao"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="camera-extra"
          label="Câmeras extras"
          sublabel="A primeira já vem incluída na diária"
          valorInicial={valores["camera-extra"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="operador-adicional"
          label="Operadores adicionais"
          valorInicial={valores["operador-adicional"] ?? 0}
        />
        <StepperField
          orcamentoId={orcamentoId}
          chave="assistente"
          label="Assistentes"
          valorInicial={valores["assistente"] ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleField orcamentoId={orcamentoId} chave="drone" label="Drone" sublabel="Equipamento aéreo" ativo={(valores["drone"] ?? 0) > 0} />
        <ToggleField orcamentoId={orcamentoId} chave="drone-fpv" label="Drone FPV" sublabel="Cinematic FPV" ativo={(valores["drone-fpv"] ?? 0) > 0} />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="iluminacao"
          label="Iluminação"
          sublabel="Kit de luz profissional"
          ativo={(valores["iluminacao"] ?? 0) > 0}
        />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="captacao-audio"
          label="Captação de áudio"
          sublabel="Lapela + boom"
          ativo={(valores["captacao-audio"] ?? 0) > 0}
        />
        <ToggleField
          orcamentoId={orcamentoId}
          chave="deslocamento"
          label="Deslocamento"
          sublabel="Cobrar diária de deslocamento"
          ativo={(valores["deslocamento"] ?? 0) > 0}
        />
      </div>

      {(itensOutros.length > 0 || catalogoOutros.length > 0) && (
        <div className="mt-4 border-t border-border pt-4">
          <ItensOrcamentoSection
            orcamentoId={orcamentoId}
            itens={itensOutros}
            catalogo={catalogoOutros}
            titulo="Outros itens de Equipe/Equipamento"
            descricao="Itens do catálogo que não têm campo fixo acima."
            permitirAvulso={false}
          />
        </div>
      )}
    </div>
  );
}
