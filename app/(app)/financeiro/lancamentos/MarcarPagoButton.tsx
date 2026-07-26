"use client";

import { useTransition } from "react";
import { marcarPago, desfazerPagamento } from "../actions";

export function MarcarPagoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => marcarPago(id))}
      className="text-xs text-accent-hover hover:underline disabled:opacity-50"
    >
      Marcar pago
    </button>
  );
}

export function DesfazerPagamentoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => desfazerPagamento(id))}
      className="text-xs text-muted hover:underline disabled:opacity-50"
    >
      Desfazer pagamento
    </button>
  );
}
