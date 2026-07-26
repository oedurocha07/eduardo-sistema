"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AvraLogo } from "@/app/components/AvraLogo";
import { solicitarReset } from "./actions";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await solicitarReset(email);
    setLoading(false);
    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="card w-full max-w-sm flex-col gap-4 p-8 shadow-2xl">
        <div className="mb-2 flex items-center gap-2">
          <AvraLogo className="h-7 w-11" />
          <span className="text-lg font-semibold text-foreground">Avra Produtora LTDA</span>
        </div>

        {enviado ? (
          <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={32} className="text-success" />
            <p className="text-sm text-foreground">
              Se esse e-mail tiver uma conta, enviamos um link para redefinir a senha. Confira sua caixa de entrada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-muted">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
            <div className="flex flex-col gap-1.5">
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
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} />
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
