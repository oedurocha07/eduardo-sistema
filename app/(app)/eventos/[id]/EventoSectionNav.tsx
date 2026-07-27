"use client";

import { useEffect, useState } from "react";

type Secao = { id: string; label: string };

export function EventoSectionNav({ secoes }: { secoes: Secao[] }) {
  const [ativa, setAtiva] = useState(secoes[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter((e) => e.isIntersecting);
        if (visiveis.length > 0) {
          const primeira = visiveis.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setAtiva(primeira.target.id);
        }
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    secoes.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [secoes]);

  return (
    <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex gap-1.5 overflow-x-auto">
        {secoes.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              ativa === s.id
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
