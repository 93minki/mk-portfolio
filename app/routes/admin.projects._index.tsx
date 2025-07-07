import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import type { Project } from "~/types/project";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  // 인증은 admin.tsx에서 자동 처리됨
  const result = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM projects ORDER BY order_index ASC, created_at DESC"
  ).all();

  return { projects: result.results as unknown as Project[] };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // 인증은 admin.tsx에서 자동 처리됨
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const projectId = formData.get("projectId");
    await context.cloudflare.env.DB.prepare("DELETE FROM projects WHERE id = ?")
      .bind(projectId)
      .run();
    return null;
  }

  if (action === "toggle-featured") {
    const projectId = formData.get("projectId");
    const currentFeatured = formData.get("currentFeatured") === "true";

    await context.cloudflare.env.DB.prepare(
      "UPDATE projects SET featured = ? WHERE id = ?"
    )
      .bind(!currentFeatured ? 1 : 0, projectId)
      .run();

    return null;
  }

  return null;
};

export default function AdminProjects() {
  const { projects } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const parseTechtack = (techStackStr: string): string[] => {
    try {
      return JSON.parse(techStackStr);
    } catch {
      return [];
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "personal":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      case "work":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            프로젝트 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            포트폴리오 프로젝트를 관리하세요
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          + 새 프로젝트 추가
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            아직 프로젝트가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            첫 번째 프로젝트를 추가해보세요!
          </p>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + 프로젝트 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                        project.category
                      )}`}
                    >
                      {project.category}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                    {Boolean(project.featured) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                        Featured
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      순서: {project.order_index}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {parseTechtack(project.tech_stack).map((tech, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 mb-3">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                      >
                        Live Demo →
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm transition-colors"
                      >
                        GitHub →
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    생성일:{" "}
                    {new Date(project.created_at).toLocaleDateString("ko-KR")}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <fetcher.Form method="post" className="inline">
                    <input
                      type="hidden"
                      name="_action"
                      value="toggle-featured"
                    />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="currentFeatured"
                      value={Boolean(project.featured).toString()}
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-2 w-full"
                    >
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                          project.featured
                            ? "bg-green-500 dark:bg-green-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            project.featured ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Featured
                      </span>
                    </button>
                  </fetcher.Form>

                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="inline-flex w-full items-center justify-center px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-md min-w-20 transition-colors"
                  >
                    편집
                  </Link>

                  <fetcher.Form method="post" className="inline">
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="projectId" value={project.id} />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded-md min-w-20 transition-colors"
                      onClick={(e) => {
                        if (!confirm("정말로 삭제하시겠습니까?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      삭제
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
