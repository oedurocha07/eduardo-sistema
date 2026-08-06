type Defaults = {
  titulo?: string;
  tipo?: string;
  local?: string | null;
  data?: string;
  dataFim?: string;
  participantes?: string | null;
  descricao?: string | null;
};

export function EventoFormFields({ defaults = {} }: { defaults?: Defaults }) {
  return (
    <>
      <input name="titulo" defaultValue={defaults.titulo ?? ""} placeholder="Título *" required className="input" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select name="tipo" defaultValue={defaults.tipo ?? "OUTRO"} className="input">
          <option value="REUNIAO">Reunião</option>
          <option value="GRAVACAO">Gravação</option>
          <option value="EDICAO">Edição</option>
          <option value="ENTREGA">Entrega</option>
          <option value="TAREFA">Tarefa</option>
          <option value="OUTRO">Outro</option>
        </select>
        <input name="local" defaultValue={defaults.local ?? ""} placeholder="Local / link" className="input" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Início</label>
          <input name="data" type="datetime-local" required defaultValue={defaults.data ?? ""} className="input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Fim</label>
          <input name="dataFim" type="datetime-local" defaultValue={defaults.dataFim ?? ""} className="input" />
        </div>
      </div>
      <input
        name="participantes"
        defaultValue={defaults.participantes ?? ""}
        placeholder="Participantes (separe por vírgula)"
        className="input"
      />
      <input name="descricao" defaultValue={defaults.descricao ?? ""} placeholder="Descrição" className="input" />
    </>
  );
}
