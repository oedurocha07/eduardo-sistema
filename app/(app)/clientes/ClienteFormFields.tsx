type Defaults = {
  nome?: string;
  cnpjCpf?: string | null;
  email?: string | null;
  endereco?: string | null;
  status?: string;
  valorMensal?: number | string | null;
  diaVencimento?: number | null;
  descricaoServico?: string | null;
  descricaoNbs?: string | null;
  codigoServicoMunicipal?: string | null;
  idClienteAsaas?: string | null;
  enviarFaturaLocacao?: boolean;
  observacoes?: string | null;
};

export function ClienteFormFields({ defaults = {} }: { defaults?: Defaults }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input name="nome" defaultValue={defaults.nome ?? ""} placeholder="Nome do cliente *" required className="input col-span-2" />
      <input name="email" defaultValue={defaults.email ?? ""} placeholder="E-mail" className="input" />
      <input name="cnpjCpf" defaultValue={defaults.cnpjCpf ?? ""} placeholder="CNPJ/CPF" className="input" />
      <input name="endereco" defaultValue={defaults.endereco ?? ""} placeholder="Endereço/CEP" className="input" />
      <select name="status" defaultValue={defaults.status ?? "ATIVO"} className="input">
        <option value="ATIVO">Ativo</option>
        <option value="PAUSADO">Pausado</option>
        <option value="ENCERRADO">Encerrado</option>
      </select>
      <input
        name="valorMensal"
        type="number"
        step="0.01"
        defaultValue={defaults.valorMensal?.toString() ?? ""}
        placeholder="Valor mensal"
        className="input"
      />
      <input
        name="diaVencimento"
        type="number"
        min={1}
        max={31}
        defaultValue={defaults.diaVencimento ?? ""}
        placeholder="Dia de vencimento"
        className="input"
      />
      <input
        name="idClienteAsaas"
        defaultValue={defaults.idClienteAsaas ?? ""}
        placeholder="ID Cliente Asaas"
        className="input"
      />
      <input
        name="descricaoNbs"
        defaultValue={defaults.descricaoNbs ?? ""}
        placeholder="Descrição NBS"
        className="input"
      />
      <input
        name="codigoServicoMunicipal"
        defaultValue={defaults.codigoServicoMunicipal ?? ""}
        placeholder="Código serviço municipal"
        className="input"
      />
      <textarea
        name="descricaoServico"
        defaultValue={defaults.descricaoServico ?? ""}
        placeholder="Descrição do serviço prestado"
        className="input col-span-2"
        rows={3}
      />
      <textarea
        name="observacoes"
        defaultValue={defaults.observacoes ?? ""}
        placeholder="Observações"
        className="input col-span-2"
        rows={2}
      />
      <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
        <input
          name="enviarFaturaLocacao"
          type="checkbox"
          defaultChecked={defaults.enviarFaturaLocacao ?? false}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Enviar fatura de locação (60/40)
      </label>
    </div>
  );
}
