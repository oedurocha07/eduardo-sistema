import { EtapaLead } from "@/app/generated/prisma/client";

export const ETAPAS: { value: EtapaLead; label: string; dot: string }[] = [
  { value: "NOVO_LEAD", label: "Novo Lead", dot: "bg-neutral-400" },
  { value: "DIAGNOSTICO", label: "Diagnóstico", dot: "bg-blue-400" },
  { value: "REUNIAO", label: "Reunião", dot: "bg-accent" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta Enviada", dot: "bg-violet-400" },
  { value: "NEGOCIACAO", label: "Negociação", dot: "bg-warning" },
  { value: "FECHADO", label: "Fechado", dot: "bg-success" },
  { value: "PERDIDO", label: "Perdido", dot: "bg-danger" },
];
