"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { redefinirSenha } from "./actions";

export function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (senha !== confirmar) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const res = await redefinirSenha(token, senha);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Erro ao redefinir senha");
      return;
    }

    setOk(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
        <AlertCircle size={16} />
        Link inválido. Solicite um novo em &quot;Esqueci minha senha&quot;.
      </div>
    );
  }

  if (ok) {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 size={32} className="text-success" />
        <p className="text-sm text-foreground">Senha redefinida! Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm text-muted">
          Nova senha
        </label>
        <input
          id="senha"
          type="password"
          required
          autoFocus
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar" className="text-sm text-muted">
          Confirmar nova senha
        </label>
        <input
          id="confirmar"
          type="password"
          required
          minLength={8}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          className="input"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
