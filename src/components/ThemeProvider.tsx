"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Sync state from what the anti-FOUC script already applied
  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem("theme") as Theme | null; } catch { return null; }
    })();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved: Theme =
      stored === "dark" ? "dark"
      : stored === "light" ? "light"
      : prefersDark ? "dark"
      : "light";
    setTheme(resolved);
    // Enable smooth transitions AFTER initial paint to avoid FOUC
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("theme", next); } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
