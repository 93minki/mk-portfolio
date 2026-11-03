import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";

export const themeInitScript = `(function() {
  try {
    var theme = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    if (theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
})();`;

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  const isDark = mounted && theme === "dark";

  return {
    theme,
    isDark,
    mounted,
    toggleTheme,
  };
}
