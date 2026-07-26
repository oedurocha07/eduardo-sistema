import { EtapaProducao } from "@/app/generated/prisma/client";

export const ETAPAS_PRODUCAO: { value: EtapaProducao; label: string; dot: string }[] = [
  { value: "BRIEFING", label: "Briefing", dot: "bg-neutral-400" },
  { value: "PRE_PRODUCAO", label: "Pré-produção", dot: "bg-blue-400" },
  { value: "CAPTACAO", label: "Captação", dot: "bg-warning" },
  { value: "EDICAO", label: "Edição", dot: "bg-violet-400" },
  { value: "REVISAO", label: "Revisão", dot: "bg-accent" },
  { value: "ENTREGA", label: "Entrega", dot: "bg-blue-400" },
  { value: "CONCLUIDA", label: "Concluída", dot: "bg-success" },
];
