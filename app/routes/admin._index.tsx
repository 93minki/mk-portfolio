import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { logoutAdmin } from "~/utils/auth";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  // 인증은 admin.tsx에서 자동 처리됨
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          관리자 대시보드
        </h1>
        <p className="text-gray-600">포트폴리오 콘텐츠를 관리하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
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

        <div className="bg-gray-50 rounded-lg p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors p-6 block"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{item.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                {item.count !== null && (
                  <span className="text-sm text-gray-500">{item.count}개</span>
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
    </div>
  );
}
