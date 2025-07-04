import { Form, Link, useLocation } from "@remix-run/react";
import { ReactNode } from "react";

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
      name: "개인정보",
      href: "/admin/personalInfo",
      current: location.pathname.startsWith("/admin/personalInfo"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← 포트폴리오로 돌아가기
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                관리자 페이지
              </h1>
            </div>

            <Form method="post" className="inline-block">
              <input type="hidden" name="_action" value="logout" />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                로그아웃
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="w-64 space-y-1 mr-8 fixed top-32 left-10">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">메뉴</h3>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
          <div className="bg-white rounded-lg shadow">{children}</div>
        </main>
      </div>
    </div>
  );
}
