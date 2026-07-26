"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { AvraLogo } from "@/app/components/AvraLogo";

export default function LoginPage() {
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
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm flex-col gap-4 p-8 shadow-2xl">
        <div className="mb-2 flex items-center gap-2">
          <AvraLogo className="h-7 w-11" />
          <span className="text-lg font-semibold text-foreground">Avra Produtora LTDA</span>
        </div>

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
    </main>
  );
}
