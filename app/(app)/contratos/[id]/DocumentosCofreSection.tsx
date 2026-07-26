"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Trash2, Paperclip } from "lucide-react";
import { createDocumentoCofre, updateDocumento, deleteDocumento } from "../actions";

type Documento = { id: string; nome: string; descricao: string | null; arquivoUrl: string | null };

function DocumentoRow({ documento, cofreId }: { documento: Documento; cofreId: string }) {
  const [nome, setNome] = useState(documento.nome);
  const [descricao, setDescricao] = useState(documento.descricao ?? "");
  const [isPending, startTransition] = useTransition();

  function salvar() {
    if (!nome.trim()) return;
    const fd = new FormData();
    fd.set("nome", nome);
    fd.set("descricao", descricao);
    startTransition(() => updateDocumento(documento.id, cofreId, fd));
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
      {documento.arquivoUrl && (
        <a href={documento.arquivoUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-accent-hover" title="Ver anexo">
          <Paperclip size={14} />
        </a>
      )}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onBlur={salvar}
        disabled={isPending}
        className="input flex-1 !py-1 text-sm"
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        onBlur={salvar}
        disabled={isPending}
        placeholder="Descrição"
        className="input flex-1 !py-1 text-sm"
      />
      <button
        type="button"
        onClick={() => startTransition(() => deleteDocumento(documento.id, cofreId))}
        className="text-muted hover:text-danger"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function DocumentosCofreSection({ cofreId, documentos }: { cofreId: string; documentos: Documento[] }) {
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="card">
      <h2 className="mb-3 font-semibold text-foreground">Contratos</h2>

      {documentos.length === 0 ? (
        <p className="mb-3 text-sm text-muted">Nenhum contrato anexado ainda.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-1.5">
          {documentos.map((doc) => (
            <DocumentoRow key={doc.id} documento={doc} cofreId={cofreId} />
          ))}
        </div>
      )}

      {aberto ? (
        <form
          ref={formRef}
          encType="multipart/form-data"
          action={(fd) => {
            startTransition(async () => {
              await createDocumentoCofre(cofreId, fd);
              formRef.current?.reset();
              setAberto(false);
            });
          }}
          className="flex flex-col gap-2 rounded-lg border border-border p-3"
        >
          <input name="nome" placeholder="Nome do contrato *" required className="input" autoFocus />
          <input name="descricao" placeholder="Descrição" className="input" />
          <input name="arquivo" type="file" className="input" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAberto(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAberto(true)} className="flex items-center gap-1 text-xs text-accent-hover hover:underline">
          <Plus size={12} /> Novo contrato
        </button>
      )}
    </div>
  );
}
