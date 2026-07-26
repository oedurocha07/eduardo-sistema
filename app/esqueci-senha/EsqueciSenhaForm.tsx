"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { solicitarReset } from "./actions";

export function EsqueciSenhaForm() {
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
    <>
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
    </>
  );
}
