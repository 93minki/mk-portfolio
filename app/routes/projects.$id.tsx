import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { Project } from "~/types/project";

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  const project = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM projects WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!project) {
    throw new Response("프로젝트를 찾을 수 없습니다", { status: 404 });
  }

  return { project: project as unknown as Project };
};

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();

  const parseTechtack = (techStackStr: string): string[] => {
    try {
      return JSON.parse(techStackStr);
    } catch {
      return [];
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      personal: "개인 프로젝트",
      client: "클라이언트 프로젝트",
      work: "회사 프로젝트",
      study: "스터디 프로젝트",
      team: "팀 프로젝트",
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: "완료",
      in_progress: "진행중",
      archived: "보관",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* 뒤로 가기 */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← 홈으로 돌아가기
        </Link>

        {/* 프로젝트 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getCategoryLabel(project.category)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {getStatusLabel(project.status)}
                </span>
                {Boolean(project.featured) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 프로젝트 이미지 */}
          {project.image_url && (
            <div className="mb-6">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 프로젝트 설명 */}
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">{project.description}</p>
            {project.long_description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {project.long_description}
                </p>
              </div>
            )}
          </div>

          {/* 기술 스택 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              사용 기술
            </h3>
            <div className="flex flex-wrap gap-2">
              {parseTechtack(project.tech_stack).map((tech, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 링크 */}
          <div className="flex gap-4">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Live Demo →
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                GitHub →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
