import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Skill } from "~/types/skill";
import { SKILL_CATEGORIES } from "~/utils/categories";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const skills = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM skills ORDER BY category, proficiency DESC, name"
  ).all();

  return {
    skills: skills.results as unknown as Skill[],
    categories: SKILL_CATEGORIES,
  };
};

type ActionData = {
  success?: boolean;
  error?: string;
  action?: string;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("_action")?.toString();

  try {
    if (action === "delete") {
      const skillId = formData.get("skillId")?.toString();

      if (!skillId) {
        return { error: "스킬 ID가 필요합니다." };
      }

      await context.cloudflare.env.DB.prepare("DELETE FROM skills WHERE id = ?")
        .bind(skillId)
        .run();

      return { success: true, action: "delete" };
    }

    if (action === "add") {
      const name = formData.get("name")?.toString();
      const category = formData.get("category")?.toString();
      const iconName = formData.get("icon_name")?.toString();
      const proficiency = parseInt(
        formData.get("proficiency")?.toString() || "2"
      );

      if (!name || !category) {
        return { error: "스킬 이름과 카테고리는 필수입니다." };
      }

      // 중복 체크
      const existingSkill = await context.cloudflare.env.DB.prepare(
        "SELECT id FROM skills WHERE name = ?"
      )
        .bind(name)
        .first();

      if (existingSkill) {
        return { error: "이미 존재하는 스킬입니다." };
      }

      try {
        await context.cloudflare.env.DB.prepare(
          "INSERT INTO skills (name, category, proficiency, icon_name) VALUES (?, ?, ?, ?)"
        )
          .bind(name, category, proficiency, iconName || null)
          .run();

        return { success: true, action: "add" };
      } catch (dbError) {
        console.error("DB Insert Error:", dbError);
        console.error("Values:", { name, category, proficiency, iconName });
        const errorMessage =
          dbError instanceof Error ? dbError.message : String(dbError);
        return {
          error: `데이터베이스 저장 중 오류가 발생했습니다: ${errorMessage}`,
        };
      }
    }

    return { error: "올바르지 않은 요청입니다." };
  } catch (error) {
    return { error: "스킬 처리 중 오류가 발생했습니다." };
  }
};

export default function Skills() {
  const { skills, categories } = useLoaderData<typeof loader>();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            스킬 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            보유 기술 스택을 관리하세요
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          대시보드로 이동
        </Link>
      </div>

      {/* 성공/에러 메시지 */}
      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md transition-colors">
          <p className="text-green-800 dark:text-green-300">
            {actionData.action === "add"
              ? "새 스킬이 성공적으로 추가되었습니다!"
              : "스킬이 성공적으로 삭제되었습니다!"}
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md transition-colors">
          <p className="text-red-800 dark:text-red-300">{actionData.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기존 스킬 리스트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            현재 보유 스킬 ({skills.length}개)
          </h2>

          {skills.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
              <p className="text-gray-500 dark:text-gray-400">
                등록된 스킬이 없습니다.
              </p>
            </div>
          ) : (
            Object.entries(skillsByCategory).map(
              ([category, categorySkills]) => {
                const categoryInfo = categories.find(
                  (cat) => cat.value === category
                );
                return (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      {categoryInfo?.label || category}
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {categorySkills.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {skill.icon_name && (
                              <img
                                src={`https://cdn.simpleicons.org/${skill.icon_name}`}
                                alt={`${skill.name} icon`}
                                className="w-6 h-6"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {skill.name}
                              </span>
                              <div className="flex items-center space-x-1 mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    skill.proficiency >= 3
                                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                                      : skill.proficiency >= 2
                                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                                  }`}
                                >
                                  {getProficiencyLabel(skill.proficiency)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Form method="post" className="inline">
                            <input
                              type="hidden"
                              name="_action"
                              value="delete"
                            />
                            <input
                              type="hidden"
                              name="skillId"
                              value={skill.id}
                            />
                            <button
                              type="submit"
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors"
                              onClick={(e) => {
                                if (!confirm("정말로 삭제하시겠습니까?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </Form>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        {/* 새 스킬 추가 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            새 스킬 추가
          </h2>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="add" />

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                스킬 이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="예: React, TypeScript, Next.js, Alpine.js"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                카테고리 *
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="icon_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                아이콘 이름 (선택)
              </label>
              <input
                type="text"
                id="icon_name"
                name="icon_name"
                placeholder="예: react, typescript, nextdotjs, alpinejs"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="https://simpleicons.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                >
                  Simple Icons
                </a>
                에서 검색 후 기술명을 그대로 입력하세요 (예: react, next.js,
                vue.js)
              </p>
            </div>

            <div>
              <label
                htmlFor="proficiency"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                숙련도
              </label>
              <select
                id="proficiency"
                name="proficiency"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                defaultValue="2"
              >
                <option value="1">초급 (Beginner)</option>
                <option value="2">중급 (Intermediate)</option>
                <option value="3">고급 (Advanced)</option>
                <option value="4">전문가 (Expert)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              스킬 추가하기
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
