// 수정

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { Project } from "~/types/project";

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { id } = params;

  const project = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM projects WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!project) {
    throw new Response("프로젝트를 찾을 수 없습니다", { status: 404 });
  }

  // tech_stack JSON 배열을 comma-separated string으로 변환
  const techStackArray = JSON.parse((project.tech_stack as string) || "[]");
  const techStackString = techStackArray.join(", ");

  return {
    project: {
      ...project,
      tech_stack: techStackString,
    } as Project & { tech_stack: string },
  };
};

type ActionData = {
  errors?: {
    title?: string;
    description?: string;
    tech_stack?: string;
    category?: string;
  };
  success?: boolean;
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  // 인증은 admin.tsx에서 자동 처리됨
  const { id } = params;
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
      UPDATE projects SET
        title = ?, 
        description = ?, 
        long_description = ?, 
        image_url = ?, 
        tech_stack = ?,
        github_url = ?, 
        demo_url = ?, 
        category = ?, 
        featured = ?, 
        status = ?, 
        order_index = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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
        order_index,
        id
      )
      .run();

    return redirect("/admin/projects");
  } catch (error) {
    return { errors: { title: "프로젝트 수정 중 오류가 발생했습니다." } };
  }
};

export default function EditProject() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin/projects"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 block"
        >
          ← 프로젝트 관리
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트 수정</h1>
        <p className="text-gray-600">프로젝트를 수정하세요</p>
      </div>

      <div className="max-w-3xl">
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
              defaultValue={project.title}
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
              defaultValue={project.description}
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
              placeholder="프로젝트의 배경, 사용한 기술, 도전한 점, 배운 점 등을 자세히 설명..."
              defaultValue={project.long_description || ""}
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
              defaultValue={project.tech_stack}
            />
            {actionData?.errors?.tech_stack && (
              <p className="mt-1 text-sm text-red-600">
                {actionData.errors.tech_stack}
              </p>
            )}
          </div>

          {/* 카테고리 */}
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
              defaultValue={project.category}
            >
              <option value="">선택하세요</option>
              <option value="personal">개인 프로젝트</option>
              <option value="client">클라이언트 프로젝트</option>
              <option value="work">회사 프로젝트</option>
            </select>
            {actionData?.errors?.category && (
              <p className="mt-1 text-sm text-red-600">
                {actionData.errors.category}
              </p>
            )}
          </div>

          {/* 상태 */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              진행 상태
            </label>
            <select
              id="status"
              name="status"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              defaultValue={project.status}
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Live Demo URL
              </label>
              <input
                type="url"
                id="demo_url"
                name="demo_url"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
                defaultValue={project.demo_url || ""}
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
                defaultValue={project.github_url || ""}
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
              placeholder="https://example.com/image.jpg"
              defaultValue={project.image_url || ""}
            />
          </div>

          {/* 옵션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="order_index"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                정렬 순서 (낮을수록 먼저)
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                min="0"
                defaultValue={project.order_index}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center pt-6">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked={Boolean(project.featured)}
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-900"
              >
                메인 페이지에 featured로 표시
              </label>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              to="/admin/projects"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              프로젝트 수정
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
