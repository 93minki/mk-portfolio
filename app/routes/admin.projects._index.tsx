import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
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
    return redirect("/admin/projects");
  }

  if (action === "toggle-featured") {
    const projectId = formData.get("projectId");
    const currentFeatured = formData.get("currentFeatured") === "true";

    await context.cloudflare.env.DB.prepare(
      "UPDATE projects SET featured = ? WHERE id = ?"
    )
      .bind(!currentFeatured, projectId)
      .run();
    return redirect("/admin/projects");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            프로젝트 관리
          </h1>
          <p className="text-gray-600">포트폴리오 프로젝트를 관리하세요</p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + 새 프로젝트 추가
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 프로젝트가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">첫 번째 프로젝트를 추가해보세요!</p>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + 프로젝트 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-50 rounded-lg p-6">
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
                    {project.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      순서: {project.order_index}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 mb-3 text-sm">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 mb-3">
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
                  <div className="flex gap-2 mb-3">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Live Demo →
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        GitHub →
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
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
                      value={project.featured.toString()}
                    />
                    <button
                      type="submit"
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${
                        project.featured
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {project.featured ? "Featured 해제" : "Featured 설정"}
                    </button>
                  </fetcher.Form>

                  <Link
                    to={`/admin/projects/${project.id}/edit`}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
                  >
                    편집
                  </Link>

                  <fetcher.Form method="post" className="inline">
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="projectId" value={project.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
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
