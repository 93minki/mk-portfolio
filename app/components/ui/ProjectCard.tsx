import { Link } from "@remix-run/react";
import type { Project } from "~/types/project";

interface ProjectCardProps {
  project: Project;
  showAdminLink?: boolean;
}

export default function ProjectCard({
  project,
  showAdminLink = false,
}: ProjectCardProps) {
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
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "client":
        return "bg-green-100 text-green-700 border border-green-200";
      case "work":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "in_progress":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "archived":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      {/* 프로젝트 이미지 영역 */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-500">이미지 준비 중</span>
          </div>
        )}
      </div>

      {/* 뱃지들 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(
            project.category
          )}`}
        >
          {project.category}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
            project.status
          )}`}
        >
          {project.status === "completed"
            ? "완료"
            : project.status === "in_progress"
            ? "진행중"
            : "보관"}
        </span>
        {project.featured && (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
            ⭐ Featured
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {project.title}
      </h3>

      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {project.description}
      </p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-6">
        {parseTechtack(project.tech_stack)
          .slice(0, 4)
          .map((tech, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-100"
            >
              {tech}
            </span>
          ))}
        {parseTechtack(project.tech_stack).length > 4 && (
          <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            +{parseTechtack(project.tech_stack).length - 4}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-3">
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Live Demo
          </a>
        )}
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        )}
      </div>

      {/* 관리자 링크 (옵션) */}
      {showAdminLink && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/admin/projects/${project.id}/edit`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            편집 →
          </Link>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {new Date(project.created_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
