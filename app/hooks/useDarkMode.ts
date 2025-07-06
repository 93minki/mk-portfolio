import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트된 후 클라이언트에서만 실행
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // 테마 변경 시 로컬 스토리지 업데이트 및 클래스 적용
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    const applyTheme = (newTheme: Theme) => {
      if (newTheme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (systemPrefersDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // 시스템 다크모드 변경 감지
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return "light";
    });
  };

  const setLightMode = () => setTheme("light");
  const setDarkMode = () => setTheme("dark");
  const setSystemMode = () => setTheme("system");

  // 실제 다크모드 상태 계산
  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        window?.matchMedia?.("(prefers-color-scheme: dark)").matches));

  return {
    theme,
    isDark,
    mounted,
    toggleTheme,
    setLightMode,
    setDarkMode,
    setSystemMode,
  };
}
