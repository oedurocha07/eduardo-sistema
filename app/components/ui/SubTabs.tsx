"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-6 pt-3">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "border-b-2 border-accent text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
