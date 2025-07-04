import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Skill } from "~/types/skill";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const skills = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM skills ORDER BY category, name"
  ).all();

  return json({ skills: skills.results as unknown as Skill[] });
};

type ActionData = {
  success?: boolean;
  error?: string;
  action?: string;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  try {
    if (intent === "delete") {
      const skillId = formData.get("skillId")?.toString();

      if (!skillId) {
        return json({ error: "스킬 ID가 필요합니다." });
      }

      await context.cloudflare.env.DB.prepare("DELETE FROM skills WHERE id = ?")
        .bind(skillId)
        .run();

      return json({ success: true, action: "delete" });
    }

    if (intent === "add") {
      const name = formData.get("name")?.toString();
      const category = formData.get("category")?.toString();
      const proficiencyLevel = formData.get("proficiencyLevel")?.toString();

      if (!name || !category) {
        return json({ error: "스킬 이름과 카테고리는 필수입니다." });
      }

      // 숙련도 문자열을 숫자로 변환
      const proficiencyMap: Record<string, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
      };

      const proficiency =
        proficiencyMap[proficiencyLevel || "intermediate"] || 2;

      await context.cloudflare.env.DB.prepare(
        "INSERT INTO skills (name, category, proficiency, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
        .bind(name, category, proficiency)
        .run();

      return json({ success: true, action: "add" });
    }

    return json({ error: "올바르지 않은 요청입니다." });
  } catch (error) {
    return json({ error: "스킬 처리 중 오류가 발생했습니다." });
  }
};

export default function Skills() {
  const { skills } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  // 숙련도 숫자를 문자열로 변환
  const getProficiencyLabel = (proficiency: number): string => {
    const labels: Record<number, string> = {
      1: "초급",
      2: "중급",
      3: "고급",
      4: "전문가",
    };
    return labels[proficiency] || "중급";
  };

  // 카테고리별로 스킬 그룹핑
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">스킬 관리</h1>
          <p className="text-gray-600">보유 기술 스택을 관리하세요</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          대시보드로 이동
        </Link>
      </div>

      {/* 성공/에러 메시지 */}
      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            {actionData.action === "add"
              ? "새 스킬이 성공적으로 추가되었습니다!"
              : "스킬이 성공적으로 삭제되었습니다!"}
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기존 스킬 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            현재 보유 스킬 ({skills.length}개)
          </h2>

          {skills.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">등록된 스킬이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(
                ([category, categorySkills]) => (
                  <div
                    key={category}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                      {category} ({categorySkills.length})
                    </h3>
                    <div className="space-y-2">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">
                                {skill.name}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getProficiencyLabel(skill.proficiency)}
                              </span>
                            </div>
                          </div>
                          <Form method="post" className="ml-4">
                            <input type="hidden" name="intent" value="delete" />
                            <input
                              type="hidden"
                              name="skillId"
                              value={skill.id}
                            />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800 transition-colors"
                              onClick={(e) => {
                                if (
                                  !confirm(
                                    `"${skill.name}" 스킬을 삭제하시겠습니까?`
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </Form>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 새 스킬 추가 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            새 스킬 추가
          </h2>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="add" />

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                스킬 이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: React, TypeScript, Node.js"
              />
            </div>

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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">카테고리를 선택하세요</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="tools">Tools</option>
                <option value="mobile">Mobile</option>
                <option value="cloud">Cloud</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="proficiencyLevel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                숙련도
              </label>
              <select
                id="proficiencyLevel"
                name="proficiencyLevel"
                defaultValue="intermediate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">초급 (Beginner)</option>
                <option value="intermediate">중급 (Intermediate)</option>
                <option value="advanced">고급 (Advanced)</option>
                <option value="expert">전문가 (Expert)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                스킬 추가하기
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
