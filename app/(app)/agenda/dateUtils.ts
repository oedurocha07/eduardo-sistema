export type AgendaView = "mes" | "semana" | "dia";

function inicioDoDia(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function calcularIntervalo(view: AgendaView, ref: Date) {
  if (view === "dia") {
    const inicio = inicioDoDia(ref);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);
    return { inicio, fim };
  }
  if (view === "semana") {
    const inicio = inicioDoDia(ref);
    inicio.setDate(inicio.getDate() - inicio.getDay());
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 7);
    return { inicio, fim };
  }
  // mes: grade completa (do domingo antes do dia 1 até o sábado depois do último dia)
  const primeiroDoMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const inicio = new Date(primeiroDoMes);
  inicio.setDate(inicio.getDate() - inicio.getDay());
  const ultimoDoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  const fim = new Date(ultimoDoMes);
  fim.setDate(fim.getDate() + (6 - fim.getDay()) + 1);
  return { inicio, fim };
}

export function proximoRef(view: AgendaView, ref: Date, direcao: 1 | -1) {
  const nova = new Date(ref);
  if (view === "dia") nova.setDate(nova.getDate() + direcao);
  else if (view === "semana") nova.setDate(nova.getDate() + direcao * 7);
  else nova.setMonth(nova.getMonth() + direcao);
  return nova;
}

export function formatarISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function mesmodia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
