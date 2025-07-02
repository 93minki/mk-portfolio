import { Link, useLocation } from "@remix-run/react";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function AdminLayout({
  children,
  title,
  breadcrumbs,
}: AdminLayoutProps) {
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
            <Link
              to="/admin/login"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <nav className="w-64 space-y-1 mr-8">
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

          {/* Main Content */}
          <main className="flex-1">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg
                          className="w-4 h-4 text-gray-400 mx-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {crumb.href ? (
                        <Link
                          to={crumb.href}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Page Title */}
            {title && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              </div>
            )}

            {/* Page Content */}
            <div className="bg-white rounded-lg shadow">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
