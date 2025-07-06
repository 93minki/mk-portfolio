import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { PersonalInfo } from "~/types/personal_info";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const personalInfoRaw = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM personal_info"
  ).all();

  // key-value 배열을 객체로 변형
  const personalInfo = (
    personalInfoRaw.results as unknown as PersonalInfo[]
  ).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  return { personalInfo };
};

type ActionData = {
  success?: boolean;
  error?: string;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  // 업데이트할 필드들
  const fieldsToUpdate = [
    "name",
    "title",
    "bio",
    "email",
    "github",
    "velog",
    "location",
  ];

  try {
    // 각 필드별로 UPDATE 또는 INSERT 실행
    for (const field of fieldsToUpdate) {
      const value = formData.get(field)?.toString() || "";

      // UPSERT (UPDATE or INSERT) 쿼리
      await context.cloudflare.env.DB.prepare(
        `
        INSERT INTO personal_info (key, value, created_at, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP
      `
      )
        .bind(field, value)
        .run();
    }

    return { success: true };
  } catch (error) {
    return { error: "개인정보 업데이트 중 오류가 발생했습니다." };
  }
};

export default function PersonalInfo() {
  const { personalInfo } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            개인정보 관리
          </h1>
          <p className="text-gray-600">포트폴리오 개인정보를 관리하세요</p>
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
            개인정보가 성공적으로 업데이트되었습니다!
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <div className="max-w-2xl">
        <Form method="post" className="space-y-6">
          {/* 이름 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={personalInfo.name || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="김민기"
            />
          </div>

          {/* 직책 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              직책/타이틀 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={personalInfo.title || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Frontend Developer"
            />
          </div>

          {/* 자기소개 */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              자기소개 *
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={personalInfo.bio || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="사용자 경험을 중시하는 Frontend Developer입니다..."
            />
          </div>

          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={personalInfo.email || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="your-email@example.com"
            />
          </div>

          {/* 위치 */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              위치
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={personalInfo.location || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seoul, South Korea"
            />
          </div>

          {/* GitHub */}
          <div>
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="github"
              name="github"
              defaultValue={personalInfo.github || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/username"
            />
          </div>

          {/* Velog */}
          <div>
            <label
              htmlFor="velog"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Velog URL
            </label>
            <input
              type="url"
              id="velog"
              name="velog"
              defaultValue={personalInfo.velog || ""}
              className="p-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://velog.io/@username"
            />
          </div>

          {/* 수정하기 버튼 */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              개인정보 수정하기
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
