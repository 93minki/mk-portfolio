import { db } from "~/lib/db.server";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { redirect , Link, useLoaderData } from "react-router";
import { logoutAdmin } from "~/utils/auth";

export const meta: MetaFunction = () => {
  return [
    { title: "관리자 대시보드" },
    {
      name: "description",
      content: "포트폴리오 콘텐츠 관리 대시보드",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export const loader = async () => {
  // 인증은 admin.tsx에서 자동 처리됨
  const projectsCount = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
  const skillsCount = db.prepare("SELECT COUNT(*) as count FROM skills").get() as { count: number };
  const featuredCount = db.prepare("SELECT COUNT(*) as count FROM projects WHERE featured = 1").get() as { count: number };

  const experiencesCount = db.prepare("SELECT COUNT(*) as count FROM experiences").get() as { count: number };

  return {
    stats: {
      totalProjects: (projectsCount?.count as number) || 0,
      totalExperiences: experiencesCount.count,
      totalSkills: (skillsCount?.count as number) || 0,
      featuredProjects: (featuredCount?.count as number) || 0,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "logout") {
    const result = await logoutAdmin(request);
    throw redirect("/", {
      headers: result.headers,
    });
  }

  return null;
};

export default function AdminIndex() {
  const { stats } = useLoaderData<typeof loader>();

  const menuItems = [
    { title: "프로젝트 관리", description: "포트폴리오 프로젝트 추가, 수정, 삭제", href: "/admin/projects", icon: "📁", counts: [{ label: "전체", value: stats.totalProjects }, { label: "메인 노출", value: stats.featuredProjects }] },
    { title: "스킬 관리", description: "보유 기술 스택 및 숙련도 관리", href: "/admin/skills", icon: "🛠️", counts: [{ label: "보유 기술", value: stats.totalSkills }] },
    { title: "경력 관리", description: "경력과 경험 추가, 수정, 삭제", href: "/admin/experiences", icon: "💼", counts: [{ label: "경력", value: stats.totalExperiences }] },
    { title: "개인정보 설정", description: "이름, 이메일, 소셜 링크 등 설정", href: "/admin/personalInfo", icon: "⚙️", counts: [] },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          관리자 대시보드
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          포트폴리오 콘텐츠를 관리하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors p-6 block"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{item.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                {item.counts.map((count) => (
                  <span key={count.label} className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                    {count.label} {count.value}개
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {item.description}
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
              관리하기 →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
