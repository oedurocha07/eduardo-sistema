"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { extrairCartaoCnpj } from "@/app/(app)/clientes/actions";

type Extraido = { nome: string | null; cnpj: string | null; endereco: string | null };

export function CartaoCnpjUpload({ onExtraido }: { onExtraido: (dados: Extraido) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleFile(file: File) {
    setErro(null);
    const fd = new FormData();
    fd.set("arquivo", file);
    startTransition(async () => {
      const resultado = await extrairCartaoCnpj(fd);
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      onExtraido(resultado);
    });
  }

  return (
    <div className="mb-4 rounded-lg border border-dashed border-border bg-background/40 p-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
        {isPending ? "Lendo o PDF..." : "Anexar Cartão CNPJ (preenche nome, CNPJ e endereço automaticamente)"}
      </button>
      {erro && <p className="mt-2 text-center text-xs text-danger">{erro}</p>}
    </div>
  );
}
