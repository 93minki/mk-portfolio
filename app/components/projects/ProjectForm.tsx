import { Form, Link } from "@remix-run/react";
import { Project } from "~/types/project";
import { getCategories } from "~/utils/categories";

interface ProjectFormProps {
  project?: Project;
  actionData: ActionData;
}

type ActionData = {
  errors?: {
    title?: string;
    description?: string;
    tech_stack?: string;
    category?: string;
  };
  success?: boolean;
};

export default function ProjectForm({ project, actionData }: ProjectFormProps) {
  const categories = getCategories("project");

  return (
    <div className="max-w-3xl p-6">
      <Form method="post" className="space-y-6">
        {/* 제목 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            프로젝트 제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="예: React Todo App"
            defaultValue={project?.title}
          />
          {actionData?.errors?.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.title}
            </p>
          )}
        </div>

        {/* 간단한 설명 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            간단한 설명 * (메인 페이지에 표시)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="TypeScript와 Tailwind CSS를 사용한 모던한 Todo 애플리케이션..."
            defaultValue={project?.description}
          />
          {actionData?.errors?.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.description}
            </p>
          )}
        </div>

        {/* 상세 설명 */}
        <div>
          <label
            htmlFor="long_description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            상세 설명 (선택사항)
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows={5}
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="프로젝트의 배경, 사용한 기술, 도전한 점, 배운 점 등을 자세히 설명..."
            defaultValue={project?.long_description}
          />
        </div>

        {/* 기술 스택 */}
        <div>
          <label
            htmlFor="tech_stack"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            기술 스택 * (쉼표로 구분)
          </label>
          <input
            type="text"
            id="tech_stack"
            name="tech_stack"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="React, TypeScript, Tailwind CSS, Vite"
            defaultValue={project?.tech_stack}
          />
          {actionData?.errors?.tech_stack && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.tech_stack}
            </p>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            카테고리 *
          </label>
          <select
            id="category"
            name="category"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            defaultValue={project?.category}
          >
            <option value="">선택하세요</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {actionData?.errors?.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {actionData.errors.category}
            </p>
          )}
        </div>

        {/* 상태 */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            진행 상태
          </label>
          <select
            id="status"
            name="status"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            defaultValue={project?.status}
          >
            <option value="completed">완료</option>
            <option value="in_progress">진행중</option>
            <option value="archived">보관</option>
          </select>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="demo_url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Live Demo URL
            </label>
            <input
              type="url"
              id="demo_url"
              name="demo_url"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="https://example.com"
              defaultValue={project?.demo_url}
            />
          </div>
          <div>
            <label
              htmlFor="github_url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="https://github.com/username/project"
              defaultValue={project?.github_url}
            />
          </div>
        </div>

        {/* 이미지 URL */}
        <div>
          <label
            htmlFor="image_url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            프로젝트 이미지 URL (선택사항)
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="https://raw.githubusercontent.com/username/repo/main/image.jpg"
            defaultValue={project?.image_url}
          />
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              ⚠️ GitHub user-attachments URL은 지원되지 않습니다
            </p>
            <p>
              <strong>권장 방법:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>GitHub Raw:</strong>{" "}
                https://raw.githubusercontent.com/username/repo/main/image.jpg
              </li>
              <li>
                <strong>Imgur:</strong> https://i.imgur.com/xxx.jpg
              </li>
              <li>
                <strong>Cloudinary:</strong>{" "}
                https://res.cloudinary.com/xxx/image/upload/xxx.jpg
              </li>
            </ul>
            <p className="text-gray-500 dark:text-gray-400">
              이미지가 외부 사이트에서 로딩 가능한 public URL이어야 합니다.
            </p>
          </div>
        </div>

        {/* 옵션들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="order_index"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              정렬 순서 (낮을수록 먼저)
            </label>
            <input
              type="number"
              id="order_index"
              name="order_index"
              min="0"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              defaultValue={project?.order_index || 0}
            />
          </div>
          <div className="flex items-center pt-6">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              defaultChecked={project?.featured}
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              메인 페이지에 featured로 표시
            </label>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex justify-end gap-4 pt-6">
          <Link
            to="/admin/projects"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            {project ? "프로젝트 수정" : "프로젝트 생성"}
          </button>
        </div>
      </Form>
    </div>
  );
}
