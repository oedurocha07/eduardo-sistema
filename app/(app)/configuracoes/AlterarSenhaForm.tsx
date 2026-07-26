"use client";

import { useState, useRef, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateSenha } from "./actions";

export function AlterarSenhaForm({ usuarioId }: { usuarioId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setOk(false);
        startTransition(async () => {
          const res = await updateSenha(formData);
          if (!res.ok) {
            setError(res.error ?? "Erro ao alterar senha");
          } else {
            setOk(true);
            formRef.current?.reset();
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <label className="text-sm text-muted">Senha atual</label>
      <input name="senhaAtual" type="password" required className="input" />
      <label className="text-sm text-muted">Nova senha</label>
      <input name="novaSenha" type="password" required minLength={8} className="input" />
      <label className="text-sm text-muted">Confirmar nova senha</label>
      <input name="confirmarSenha" type="password" required minLength={8} className="input" />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {ok && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 size={14} />
          Senha alterada com sucesso.
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary mt-2 w-fit">
        {isPending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
