import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

// 새 스키마에 맞는 프로젝트 타입 정의
interface Project {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  image_url?: string;
  tech_stack: string; // JSON 문자열
  github_url?: string;
  demo_url?: string;
  category: "personal" | "client" | "work";
  featured: boolean;
  status: "completed" | "in_progress" | "archived";
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "김민기 - Frontend Developer" },
    {
      name: "description",
      content:
        "React와 TypeScript를 주로 사용하는 프론트엔드 개발자 포트폴리오",
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const result = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM projects WHERE featured = 1 ORDER BY order_index ASC, created_at DESC LIMIT 6"
  ).all();

  return { projects: result.results as unknown as Project[] };
};

export default function Index() {
  const { projects } = useLoaderData<typeof loader>();

  const parseTechtack = (techStackStr: string): string[] => {
    try {
      return JSON.parse(techStackStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">김민기</h1>
          <p className="text-xl text-gray-600 mb-6">Frontend Developer</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            사용자 경험을 중시하는 프론트엔드 개발자입니다. React와 TypeScript를
            주로 사용하며, 모던한 웹 기술에 관심이 많습니다.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                    {project.category}
                  </span>
                  {project.status === "in_progress" && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded ml-2">
                      In Progress
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>

                <p className="text-gray-600 mb-4 text-sm">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {parseTechtack(project.tech_stack).map((tech, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Live Demo →
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      GitHub →
                    </a>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  {new Date(project.created_at).toLocaleDateString("ko-KR")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Link - 개발 중에만 표시 */}
        <div className="text-center">
          <a
            href="/admin"
            className="inline-block px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400 transition-colors"
          >
            관리자 페이지 →
          </a>
        </div>
      </div>
    </div>
  );
}
