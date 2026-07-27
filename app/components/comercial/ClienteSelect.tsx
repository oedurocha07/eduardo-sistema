type Opcao = { id: string; label: string };

export function ClienteSelect({
  name = "alvo",
  defaultValue = "",
  clientesRecorrentes,
  clientesFreela,
  required = false,
  className = "input",
}: {
  name?: string;
  defaultValue?: string;
  clientesRecorrentes: Opcao[];
  clientesFreela: Opcao[];
  required?: boolean;
  className?: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue} required={required} className={className}>
      <option value="">{required ? "Selecione o cliente..." : "Sem vínculo"}</option>
      {clientesRecorrentes.length > 0 && (
        <optgroup label="Clientes Recorrentes">
          {clientesRecorrentes.map((c) => (
            <option key={c.id} value={`clienteRecorrente:${c.id}`}>
              {c.label}
            </option>
          ))}
        </optgroup>
      )}
      {clientesFreela.length > 0 && (
        <optgroup label="Base Freelance">
          {clientesFreela.map((c) => (
            <option key={c.id} value={`cliente:${c.id}`}>
              {c.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
