import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useDarkMode() {
  // 초기 상태를 시스템 설정에 맞게 설정
  const [theme, setTheme] = useState<Theme>(() => {
    // 서버사이드에서는 기본값 반환
    if (typeof window === "undefined") return "light";

    // 클라이언트에서는 시스템 설정을 확인
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트된 후 로컬 스토리지 확인
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) {
      setTheme(saved);
    }
    // 저장된 설정이 없으면 이미 시스템 설정으로 초기화되어 있음
  }, []);

  // 테마 변경 시 로컬 스토리지 업데이트 및 클래스 적용
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  // 실제 다크모드 상태 계산
  const isDark = mounted && theme === "dark";

  return {
    theme,
    isDark,
    mounted,
    toggleTheme,
  };
}
