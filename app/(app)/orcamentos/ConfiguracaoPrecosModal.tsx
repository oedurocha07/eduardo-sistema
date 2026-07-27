"use client";

import { useState, useRef, useTransition } from "react";
import { Settings, X, Plus, Trash2 } from "lucide-react";
import { createItemCatalogo, updateItemCatalogo, deleteItemCatalogo } from "./actions";

type Item = { id: string; nome: string; categoria: string; unidade: string; precoBase: number };

const UNIDADES = ["diária", "hora", "peça", "vídeo", "projeto", "taxa", "km", "dias", "unidade"];

function SelectUnidade({
  value,
  onChange,
  onBlur,
  disabled,
  name,
}: {
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className="input w-28 !py-1 text-xs"
    >
      {!UNIDADES.includes(value) && value && <option value={value}>{value}</option>}
      {UNIDADES.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  );
}

function ItemCatalogoRow({ item }: { item: Item }) {
  const [nome, setNome] = useState(item.nome);
  const [categoria, setCategoria] = useState(item.categoria);
  const [unidade, setUnidade] = useState(item.unidade);
  const [precoBase, setPrecoBase] = useState(item.precoBase);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    if (!nome.trim() || !categoria.trim()) return;
    startTransition(() => updateItemCatalogo(item.id, nome, precoBase, unidade, categoria));
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onBlur={salvar}
        disabled={isPending}
        placeholder="nome"
        className="input flex-1 !py-1 text-xs"
      />
      <input
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        onBlur={salvar}
        disabled={isPending}
        placeholder="categoria"
        className="input w-32 !py-1 text-xs"
      />
      <SelectUnidade
        value={unidade}
        onChange={(v) => {
          setUnidade(v);
          startTransition(() => updateItemCatalogo(item.id, nome, precoBase, v, categoria));
        }}
        disabled={isPending}
      />
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted">R$</span>
        <input
          type="number"
          step="0.01"
          value={precoBase}
          onChange={(e) => setPrecoBase(Number(e.target.value))}
          onBlur={salvar}
          disabled={isPending}
          className="input w-24 !py-1 text-xs"
        />
      </div>
      <button
        type="button"
        onClick={() => startTransition(() => deleteItemCatalogo(item.id))}
        className="text-muted hover:text-danger"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ConfiguracaoPrecosModal({ itens }: { itens: Item[] }) {
  const [open, setOpen] = useState(false);
  const [novoAberto, setNovoAberto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const ORDEM_CATEGORIAS = ["Equipe", "Equipamento", "Logística", "Pós-produção", "Extras"];
  const categoriasPresentes = Array.from(new Set(itens.map((i) => i.categoria)));
  const categorias = [
    ...ORDEM_CATEGORIAS.filter((c) => categoriasPresentes.includes(c)),
    ...categoriasPresentes.filter((c) => !ORDEM_CATEGORIAS.includes(c)),
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary">
        <Settings size={15} />
        Configuração de preços
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="card relative z-10 max-h-[85vh] w-full max-w-2xl gap-0 overflow-y-auto p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Configuração de preços</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <p className="mb-4 text-xs text-muted">
              Defina quanto você cobra por cada item. Os orçamentos usam esses valores como ponto de partida. Todos os
              campos são editáveis, mesmo nos itens já predefinidos.
            </p>

            <div className="flex flex-col gap-5">
              {categorias.map((categoria) => (
                <div key={categoria}>
                  <h3 className="mb-2 text-xs font-semibold text-muted uppercase">{categoria}</h3>
                  <div className="flex flex-col gap-1.5">
                    {itens
                      .filter((i) => i.categoria === categoria)
                      .map((item) => (
                        <ItemCatalogoRow key={item.id} item={item} />
                      ))}
                  </div>
                </div>
              ))}
              {itens.length === 0 && <p className="text-sm text-muted">Nenhum item cadastrado ainda.</p>}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              {novoAberto ? (
                <form
                  ref={formRef}
                  action={(fd) => {
                    startTransition(async () => {
                      await createItemCatalogo(fd);
                      formRef.current?.reset();
                      setNovoAberto(false);
                    });
                  }}
                  className="flex flex-wrap gap-2"
                >
                  <input name="nome" placeholder="Nome do item *" required className="input flex-1 !py-1.5 text-xs" autoFocus />
                  <input name="categoria" placeholder="Categoria" className="input w-32 !py-1.5 text-xs" />
                  <SelectUnidade name="unidade" value="diária" />
                  <input name="precoBase" type="number" step="0.01" placeholder="Preço" className="input w-24 !py-1.5 text-xs" />
                  <button type="submit" disabled={isPending} className="btn-primary !px-3 !py-1.5 text-xs">
                    Adicionar
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setNovoAberto(true)}
                  className="flex items-center gap-1 text-xs text-accent-hover hover:underline"
                >
                  <Plus size={12} /> Novo item no catálogo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
