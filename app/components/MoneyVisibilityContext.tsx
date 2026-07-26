"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "money-hidden";

const MoneyVisibilityContext = createContext<{ hidden: boolean; toggle: () => void }>({
  hidden: false,
  toggle: () => {},
});

export function MoneyVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <MoneyVisibilityContext.Provider value={{ hidden, toggle }}>{children}</MoneyVisibilityContext.Provider>
  );
}

export function useMoneyVisibility() {
  return useContext(MoneyVisibilityContext);
}
