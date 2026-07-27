/**
 * Converte uma string vinda de um input datetime-local ("YYYY-MM-DDTHH:mm")
 * num Date de forma independente do fuso horário do processo Node.
 *
 * Sem isso, `new Date("2026-07-27T14:30")` é interpretado no fuso horário
 * local do processo — se o container roda em UTC ou America/Sao_Paulo, o
 * mesmo texto vira instantes diferentes. Como o valor é salvo numa coluna
 * `timestamp without time zone` e sempre exibido de volta como o mesmo
 * horário literal (sem conversão), a gente força a interpretação como UTC
 * pra manter "o que foi digitado é o que aparece", em qualquer fuso do
 * servidor.
 */
export function parseDataHoraLocal(raw: string): Date {
  if (!raw) return new Date(NaN);
  // já tem timezone explícito (Z ou +/-HH:MM) — respeita como está
  if (/[Zz]$|[+-]\d{2}:?\d{2}$/.test(raw)) return new Date(raw);
  // tem componente de hora (datetime-local) — força UTC pra ficar
  // independente do fuso do processo
  if (raw.includes("T")) return new Date(`${raw}Z`);
  // só data (YYYY-MM-DD) já é UTC por padrão do ECMAScript
  return new Date(raw);
}
