"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "vi";
export type L10n = { en: string; vi: string };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (v: L10n) => string };

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (v) => v.en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "vi" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: (v) => v[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
