import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth";

type ActionData = {
  errors?: {
    title?: string;
    description?: string;
    tech_stack?: string;
    category?: string;
  };
  success?: boolean;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // 관리자 인증 체크
  await requireAdmin(request, context.cloudflare.env);
  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // 관리자 인증 체크
  await requireAdmin(request, context.cloudflare.env);

  const formData = await request.formData();

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const long_description = formData.get("long_description")?.toString() || null;
  const image_url = formData.get("image_url")?.toString() || null;
  const tech_stack = formData.get("tech_stack")?.toString();
  const github_url = formData.get("github_url")?.toString() || null;
  const demo_url = formData.get("demo_url")?.toString() || null;
  const category = formData.get("category")?.toString();
  const featured = formData.get("featured") === "on";
  const status = formData.get("status")?.toString() || "completed";
  const order_index = parseInt(formData.get("order_index")?.toString() || "0");

  // 입력 검증
  const errors: ActionData["errors"] = {};

  if (!title?.trim()) {
    errors.title = "프로젝트 제목이 필요합니다.";
  }

  if (!description?.trim()) {
    errors.description = "프로젝트 설명이 필요합니다.";
  }

  if (!tech_stack?.trim()) {
    errors.tech_stack = "기술 스택이 필요합니다.";
  }

  if (!category) {
    errors.category = "카테고리를 선택해주세요.";
  }

  // 기술 스택이 JSON 형태인지 확인
  if (tech_stack) {
    try {
      const techArray = tech_stack
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (techArray.length === 0) {
        errors.tech_stack = "최소 하나의 기술 스택이 필요합니다.";
      }
    } catch {
      errors.tech_stack = "기술 스택 형식이 올바르지 않습니다.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // 기술 스택을 JSON 배열로 변환
  const techArray = tech_stack!
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const techStackJson = JSON.stringify(techArray);

  try {
    await context.cloudflare.env.DB.prepare(
      `
      INSERT INTO projects (
        title, description, long_description, image_url, tech_stack, 
        github_url, demo_url, category, featured, status, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        title,
        description,
        long_description,
        image_url,
        techStackJson,
        github_url,
        demo_url,
        category,
        featured ? 1 : 0,
        status,
        order_index
      )
      .run();

    return redirect("/admin/projects");
  } catch (error) {
    return { errors: { title: "프로젝트 생성 중 오류가 발생했습니다." } };
  }
};

export default function NewProject() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/projects"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 block"
              >
                ← 프로젝트 관리
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                새 프로젝트 추가
              </h1>
              <p className="text-gray-600">
                포트폴리오에 새로운 프로젝트를 추가하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <Form method="post" className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                프로젝트 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: React Todo App"
              />
              {actionData?.errors?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.errors.title}
                </p>
              )}
            </div>

            {/* 간단한 설명 */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                간단한 설명 * (메인 페이지에 표시)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="TypeScript와 Tailwind CSS를 사용한 모던한 Todo 애플리케이션..."
              />
              {actionData?.errors?.description && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.errors.description}
                </p>
              )}
            </div>

            {/* 상세 설명 */}
            <div>
              <label
                htmlFor="long_description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                상세 설명 (선택사항)
              </label>
              <textarea
                id="long_description"
                name="long_description"
                rows={5}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="프로젝트의 상세한 설명, 개발 과정, 해결한 문제점 등을 작성하세요..."
              />
            </div>

            {/* 기술 스택 */}
            <div>
              <label
                htmlFor="tech_stack"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                기술 스택 * (쉼표로 구분)
              </label>
              <input
                type="text"
                id="tech_stack"
                name="tech_stack"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="React, TypeScript, Tailwind CSS, Vite"
              />
              <p className="mt-1 text-sm text-gray-500">
                기술 스택을 쉼표로 구분해서 입력하세요 (예: React, TypeScript,
                Tailwind CSS)
              </p>
              {actionData?.errors?.tech_stack && (
                <p className="mt-1 text-sm text-red-600">
                  {actionData.errors.tech_stack}
                </p>
              )}
            </div>

            {/* URL 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="demo_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  라이브 데모 URL
                </label>
                <input
                  type="url"
                  id="demo_url"
                  name="demo_url"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://my-project.vercel.app"
                />
              </div>

              <div>
                <label
                  htmlFor="github_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="github_url"
                  name="github_url"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>

            {/* 이미지 URL */}
            <div>
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                프로젝트 이미지 URL (선택사항)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/project-image.jpg"
              />
            </div>

            {/* 설정들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  카테고리 *
                </label>
                <select
                  id="category"
                  name="category"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">선택하세요</option>
                  <option value="personal">개인 프로젝트</option>
                  <option value="client">클라이언트 작업</option>
                  <option value="work">회사 프로젝트</option>
                </select>
                {actionData?.errors?.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {actionData.errors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="completed"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="completed">완료됨</option>
                  <option value="in_progress">진행 중</option>
                  <option value="archived">보관됨</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="order_index"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  정렬 순서
                </label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  defaultValue={0}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 메인 노출 여부 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-900"
              >
                메인 페이지에 노출 (Featured)
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Link
                to="/admin/projects"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                취소
              </Link>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                프로젝트 추가
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
