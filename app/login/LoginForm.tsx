"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao entrar");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="contents">
      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="senha" className="text-sm text-muted">
            Senha
          </label>
          <Link href="/esqueci-senha" className="text-xs text-accent-hover hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
