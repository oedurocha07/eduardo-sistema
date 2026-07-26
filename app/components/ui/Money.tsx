"use client";

import { useMoneyVisibility } from "@/app/components/MoneyVisibilityContext";

export function Money({
  value,
  sign,
  suffix,
  className,
}: {
  value: number;
  sign?: "+" | "-";
  suffix?: string;
  className?: string;
}) {
  const { hidden } = useMoneyVisibility();

  return (
    <span className={className}>
      {hidden ? (
        <>
          {sign}R$ ••••••{suffix ? <span className="font-normal text-muted">{suffix}</span> : null}
        </>
      ) : (
        <>
          {sign}R$ {value.toLocaleString("pt-BR")}
          {suffix ? <span className="font-normal text-muted">{suffix}</span> : null}
        </>
      )}
    </span>
  );
}
