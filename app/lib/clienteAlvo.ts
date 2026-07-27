export function parseClienteAlvo(alvo: string): { clienteId: string | null; clienteRecorrenteId: string | null } {
  const [tipo, id] = alvo.split(":");
  return {
    clienteId: tipo === "cliente" ? id : null,
    clienteRecorrenteId: tipo === "clienteRecorrente" ? id : null,
  };
}
