type Opcao = { id: string; label: string };

type Defaults = {
  tipo?: string;
  nomeCompleto?: string;
  apelido?: string | null;
  cpfCnpj?: string | null;
  responsavel?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  clienteId?: string | null;
};

export function CofreFormFields({ defaults = {}, clientes = [] }: { defaults?: Defaults; clientes?: Opcao[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <select name="tipo" defaultValue={defaults.tipo ?? "JURIDICA"} className="input col-span-2">
        <option value="JURIDICA">Pessoa Jurídica</option>
        <option value="FISICA">Pessoa Física</option>
      </select>

      <input
        name="nomeCompleto"
        defaultValue={defaults.nomeCompleto ?? ""}
        placeholder="Nome completo / Razão social *"
        required
        className="input col-span-2"
      />
      <input name="apelido" defaultValue={defaults.apelido ?? ""} placeholder="Apelido" className="input" />
      <input name="cpfCnpj" defaultValue={defaults.cpfCnpj ?? ""} placeholder="CPF/CNPJ" className="input" />
      <input name="responsavel" defaultValue={defaults.responsavel ?? ""} placeholder="Responsável / quem assina" className="input col-span-2" />
      <input name="email" type="email" defaultValue={defaults.email ?? ""} placeholder="E-mail" className="input" />
      <input name="telefone" defaultValue={defaults.telefone ?? ""} placeholder="Telefone/WhatsApp" className="input" />
      <input name="endereco" defaultValue={defaults.endereco ?? ""} placeholder="Endereço" className="input col-span-2" />
      <input name="cidade" defaultValue={defaults.cidade ?? ""} placeholder="Cidade" className="input" />
      <div className="grid grid-cols-2 gap-3">
        <input name="estado" defaultValue={defaults.estado ?? ""} placeholder="UF" maxLength={2} className="input" />
        <input name="cep" defaultValue={defaults.cep ?? ""} placeholder="CEP" className="input" />
      </div>

      {clientes.length > 0 && (
        <select name="clienteId" defaultValue={defaults.clienteId ?? ""} className="input col-span-2">
          <option value="">Não vincular a nenhum cliente cadastrado</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      )}

      <textarea
        name="observacoes"
        defaultValue={defaults.observacoes ?? ""}
        placeholder="Observações internas"
        className="input col-span-2"
        rows={2}
      />
    </div>
  );
}
