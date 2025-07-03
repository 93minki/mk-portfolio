import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { Link, redirect, useActionData } from "@remix-run/react";
import ProjectForm from "~/components/projects/ProjectForm";

type ActionData = {
  errors?: {
    title?: string;
    description?: string;
    tech_stack?: string;
    category?: string;
  };
  success?: boolean;
};

export const loader = () => {
  // 인증은 admin.tsx에서 자동 처리됨
  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // 인증은 admin.tsx에서 자동 처리됨
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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/projects"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 block"
        >
          ← 프로젝트 관리
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          새 프로젝트 추가
        </h1>
        <p className="text-gray-600">
          포트폴리오에 새로운 프로젝트를 추가하세요
        </p>
      </div>

      <ProjectForm actionData={actionData || {}} />
    </div>
  );
}
