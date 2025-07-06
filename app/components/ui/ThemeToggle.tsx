import { useDarkMode } from "~/hooks/useDarkMode";

export default function ThemeToggle() {
  const { theme, isDark, mounted, toggleTheme } = useDarkMode();

  // 서버사이드 렌더링 중에는 아이콘을 표시하지 않음 (hydration 불일치 방지)
  if (!mounted) {
    return (
      <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <div className="w-5 h-5" /> {/* 플레이스홀더 */}
      </button>
    );
  }

  // 현재 실제 다크모드 상태에 따라 아이콘 결정
  const getIcon = () => {
    if (isDark) {
      // 다크 모드일 때 달 아이콘
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    } else {
      // 라이트 모드일 때 태양 아이콘
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }
  };

  const getLabel = () => {
    if (theme === "light") return "라이트 모드 (다크 모드로 전환)";
    if (theme === "dark") return "다크 모드 (시스템 설정으로 전환)";
    return `시스템 설정 (${isDark ? "다크" : "라이트"} 모드 적용 중)`;
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
}
