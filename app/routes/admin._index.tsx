import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { logoutAdmin, requireAdmin } from "~/utils/auth";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // 관리자 인증 체크
  await requireAdmin(request, context.cloudflare.env);

  // 통계 데이터 조회
  const [projectsCount, skillsCount, featuredCount] = await Promise.all([
    context.cloudflare.env.DB.prepare(
      "SELECT COUNT(*) as count FROM projects"
    ).first(),
    context.cloudflare.env.DB.prepare(
      "SELECT COUNT(*) as count FROM skills"
    ).first(),
    context.cloudflare.env.DB.prepare(
      "SELECT COUNT(*) as count FROM projects WHERE featured = 1"
    ).first(),
  ]);

  return {
    stats: {
      totalProjects: (projectsCount?.count as number) || 0,
      totalSkills: (skillsCount?.count as number) || 0,
      featuredProjects: (featuredCount?.count as number) || 0,
    },
  };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "logout") {
    const result = await logoutAdmin(request, context.cloudflare.env);
    throw redirect("/", {
      headers: result.headers,
    });
  }

  return null;
};

export default function AdminIndex() {
  const { stats } = useLoaderData<typeof loader>();

  const menuItems = [
    {
      title: "프로젝트 관리",
      description: "포트폴리오 프로젝트 추가, 수정, 삭제",
      href: "/admin/projects",
      icon: "📁",
      count: stats.totalProjects,
    },
    {
      title: "스킬 관리",
      description: "보유 기술 스택 및 숙련도 관리",
      href: "/admin/skills",
      icon: "🛠️",
      count: stats.totalSkills,
    },
    {
      title: "개인정보 설정",
      description: "이름, 이메일, 소셜 링크 등 설정",
      href: "/admin/settings",
      icon: "⚙️",
      count: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
              <p className="text-gray-600">포트폴리오 콘텐츠를 관리하세요</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← 메인 사이트로
              </Link>
              <Form method="post">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  P
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  전체 프로젝트
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  F
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  메인 노출 프로젝트
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.featuredProjects}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  S
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">보유 기술</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSkills}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{item.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  {item.count !== null && (
                    <span className="text-sm text-gray-500">
                      {item.count}개
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{item.description}</p>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                관리하기 →
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            빠른 작업
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              + 새 프로젝트 추가
            </Link>
            <Link
              to="/admin/skills"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              스킬 관리
            </Link>
            <Link
              to="/admin/settings"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              설정 변경
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
