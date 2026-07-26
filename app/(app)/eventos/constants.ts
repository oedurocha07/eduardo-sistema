import { StatusEvento, FaseChecklist, StatusEquipamento, TipoCustoEvento } from "@/app/generated/prisma/client";

export const STATUS_EVENTO: { value: StatusEvento; label: string; tone: "neutral" | "accent" | "success" | "danger" | "warning" }[] = [
  { value: "PLANEJAMENTO", label: "Planejamento", tone: "neutral" },
  { value: "CONFIRMADO", label: "Confirmado", tone: "accent" },
  { value: "AO_VIVO", label: "Ao vivo", tone: "danger" },
  { value: "ENCERRADO", label: "Encerrado", tone: "success" },
];

export const FASES_CHECKLIST: { value: FaseChecklist; label: string }[] = [
  { value: "PREPARACAO", label: "Preparação" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "OPERACAO", label: "Operação" },
  { value: "ENCERRAMENTO", label: "Encerramento" },
];

export const STATUS_EQUIPAMENTO: { value: StatusEquipamento; label: string; tone: "neutral" | "accent" | "success" | "warning" }[] = [
  { value: "PENDENTE", label: "Pendente", tone: "warning" },
  { value: "SEPARADO", label: "Separado", tone: "accent" },
  { value: "NO_LOCAL", label: "No local", tone: "accent" },
  { value: "DEVOLVIDO", label: "Devolvido", tone: "success" },
];

export const TIPOS_CUSTO: { value: TipoCustoEvento; label: string }[] = [
  { value: "CACHE", label: "Cachê" },
  { value: "ADICIONAL", label: "Adicional" },
  { value: "EQUIPAMENTO", label: "Equipamento" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "OUTRO", label: "Outro" },
];

export const FUNCOES_EQUIPE = [
  "Videomaker",
  "Fotógrafo",
  "Produção",
  "Áudio",
  "FPV",
  "Realtime",
  "Direção",
  "Iluminação",
];

// Cores para os ambientes na timeline (ciclo)
export const CORES_AMBIENTE = ["#ebbb1c", "#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#06b6d4"];
