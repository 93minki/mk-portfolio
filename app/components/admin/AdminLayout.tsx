import { Form, Link, useLocation } from "@remix-run/react";
import { ReactNode } from "react";
import ThemeToggle from "~/components/ui/ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const navigation = [
    {
      name: "대시보드",
      href: "/admin",
      current: location.pathname === "/admin",
    },
    {
      name: "프로젝트",
      href: "/admin/projects",
      current: location.pathname.startsWith("/admin/projects"),
    },
    {
      name: "스킬관리",
      href: "/admin/skills",
      current: location.pathname.startsWith("/admin/skills"),
    },
    {
      name: "경력관리",
      href: "/admin/experiences",
      current: location.pathname.startsWith("/admin/experiences"),
    },
    {
      name: "개인정보",
      href: "/admin/personalInfo",
      current: location.pathname.startsWith("/admin/personalInfo"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                ← 포트폴리오로 돌아가기
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                관리자 페이지
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Form method="post" className="inline-block">
                <input type="hidden" name="_action" value="logout" />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="w-64 space-y-1 mr-8 fixed top-32 left-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 transition-colors">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            메뉴
          </h3>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
