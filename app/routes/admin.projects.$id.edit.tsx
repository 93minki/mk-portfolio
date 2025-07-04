// 수정

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, redirect, useActionData, useLoaderData } from "@remix-run/react";
import ProjectForm from "~/components/projects/ProjectForm";
import { Project } from "~/types/project";
import { loadCategories } from "~/utils/categories";

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { id } = params;

  const [project, projectCategories] = await Promise.all([
    context.cloudflare.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
      .bind(id)
      .first(),
    loadCategories("project"),
  ]);

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
    projectCategories,
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
  const { project, projectCategories } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="p-6 max-w-3xl mx-auto">
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

      <ProjectForm
        project={project}
        actionData={actionData || {}}
        categories={projectCategories}
      />
    </div>
  );
}
