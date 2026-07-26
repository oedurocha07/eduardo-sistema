"use client";

import { useTransition } from "react";
import { marcarPago } from "../actions";

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
