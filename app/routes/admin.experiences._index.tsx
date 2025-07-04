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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">경력 관리</h1>
          <p className="text-gray-600">경력과 경험을 관리하세요</p>
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
              ? "새 경력이 성공적으로 추가되었습니다!"
              : "경력이 성공적으로 삭제되었습니다!"}
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기존 경력 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            현재 경력 ({experiences.length}개)
          </h2>

          {experiences.length === 0 ? (
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
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8"
                  />
                </svg>
              </div>
              <p className="text-gray-500">등록된 경력이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div
                  key={experience.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {experience.position}
                      </h3>
                      {experience.is_current && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          현재 근무중
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium text-sm mb-1">
                      {experience.company_name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {getPeriod(experience)}
                    </p>
                    {experience.location && (
                      <p className="text-gray-500 text-sm">
                        {experience.location}
                      </p>
                    )}
                  </div>
                  <Form method="post" className="ml-4">
                    <input type="hidden" name="intent" value="delete" />
                    <input
                      type="hidden"
                      name="experienceId"
                      value={experience.id}
                    />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={(e) => {
                        if (
                          !confirm(
                            `"${experience.company_name}"에서의 경력을 삭제하시겠습니까?`
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
          )}
        </div>

        {/* 새 경력 추가 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            새 경력 추가
          </h2>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="add" />

            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                회사명 *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 테크 스타트업"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                직책/직위 *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: Frontend Developer"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                업무 설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="- 주요 업무 내용을 줄바꿈으로 구분해서 작성하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  시작일 *
                </label>
                <input
                  type="month"
                  id="start_date"
                  name="start_date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  종료일
                </label>
                <input
                  type="month"
                  id="end_date"
                  name="end_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="현재 근무중이면 비워두세요"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                근무지
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: Seoul, Korea"
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_current"
                name="is_current"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_current"
                className="ml-2 block text-sm text-gray-900"
              >
                현재 근무중
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                경력 추가하기
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
