export type AgendaView = "mes" | "semana" | "dia";

function inicioDoDia(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function calcularIntervalo(view: AgendaView, ref: Date) {
  if (view === "dia") {
    const inicio = inicioDoDia(ref);
    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);
    return { inicio, fim };
  }
  if (view === "semana") {
    const inicio = inicioDoDia(ref);
    inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay());
    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 7);
    return { inicio, fim };
  }
  // mes: grade completa (do domingo antes do dia 1 até o sábado depois do último dia)
  const primeiroDoMes = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
  const inicio = new Date(primeiroDoMes);
  inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay());
  const ultimoDoMes = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 0));
  const fim = new Date(ultimoDoMes);
  fim.setUTCDate(fim.getUTCDate() + (6 - fim.getUTCDay()) + 1);
  return { inicio, fim };
}

export function proximoRef(view: AgendaView, ref: Date, direcao: 1 | -1) {
  const nova = new Date(ref);
  if (view === "dia") nova.setUTCDate(nova.getUTCDate() + direcao);
  else if (view === "semana") nova.setUTCDate(nova.getUTCDate() + direcao * 7);
  else nova.setUTCMonth(nova.getUTCMonth() + direcao);
  return nova;
}

export function formatarISODate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function mesmodia(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}
