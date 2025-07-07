import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Experience } from "~/types/experience";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const experiences = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM experiences ORDER BY is_current DESC, start_date DESC"
  ).all();

  return { experiences: experiences.results as unknown as Experience[] };
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
      const experienceId = formData.get("experienceId")?.toString();

      if (!experienceId) {
        return { error: "경력 ID가 필요합니다." };
      }

      await context.cloudflare.env.DB.prepare(
        "DELETE FROM experiences WHERE id = ?"
      )
        .bind(experienceId)
        .run();

      return { success: true, action: "delete" };
    }

    if (intent === "add") {
      const company_name = formData.get("company_name")?.toString();
      const position = formData.get("position")?.toString();
      const description = formData.get("description")?.toString();
      const start_date = formData.get("start_date")?.toString();
      const end_date = formData.get("end_date")?.toString();
      const is_current = formData.get("is_current") === "on";
      const location = formData.get("location")?.toString();

      if (!company_name || !position || !start_date) {
        return { error: "회사명, 직책, 시작일은 필수입니다." };
      }

      await context.cloudflare.env.DB.prepare(
        "INSERT INTO experiences (company_name, position, description, start_date, end_date, is_current, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
        .bind(
          company_name,
          position,
          description || null,
          start_date,
          is_current ? null : end_date || null,
          is_current ? 1 : 0,
          location || null
        )
        .run();

      return { success: true, action: "add" };
    }

    return { error: "올바르지 않은 요청입니다." };
  } catch (error) {
    return { error: "경력 처리 중 오류가 발생했습니다." };
  }
};

export default function Experiences() {
  const { experiences } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const [year, month] = dateString.split("-");
    return `${year}.${month.padStart(2, "0")}`;
  };

  // 기간 계산 함수
  const getPeriod = (experience: Experience): string => {
    const startDate = formatDate(experience.start_date);
    if (experience.is_current || !experience.end_date) {
      return `${startDate} - 현재`;
    }
    const endDate = formatDate(experience.end_date);
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            경력 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            경력과 경험을 관리하세요
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
              ? "새 경력이 성공적으로 추가되었습니다!"
              : "경력이 성공적으로 삭제되었습니다!"}
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md transition-colors">
          <p className="text-red-800 dark:text-red-300">{actionData.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기존 경력 리스트 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            현재 경력 ({experiences.length}개)
          </h2>

          {experiences.length === 0 ? (
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
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                등록된 경력이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div
                  key={experience.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {experience.position}
                        </h3>
                        {experience.is_current && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                            현재 근무중
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {experience.company_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {getPeriod(experience)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {experience.location}
                      </p>
                      {experience.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {experience.description}
                        </p>
                      )}
                    </div>
                    <Form method="post" className="ml-4">
                      <input type="hidden" name="_action" value="delete" />
                      <input
                        type="hidden"
                        name="experienceId"
                        value={experience.id}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 새 경력 추가 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            새 경력 추가
          </h2>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="add" />

            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                회사명 *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                placeholder="예: 테크 스타트업"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                직책/직위 *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                placeholder="예: Frontend Developer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                업무 설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="주요 업무, 성과 등을 설명해주세요"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  시작일
                </label>
                <input
                  type="month"
                  id="start_date"
                  name="start_date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  종료일
                </label>
                <input
                  type="month"
                  id="end_date"
                  name="end_date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                근무지
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="예: Seoul, Korea"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_current"
                name="is_current"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label
                htmlFor="is_current"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                현재 근무중
              </label>
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              경력 추가하기
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
