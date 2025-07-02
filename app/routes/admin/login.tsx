import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, redirect, useActionData } from "@remix-run/react";
import { isAdminLoggedIn, loginAdmin } from "~/utils/auth";

type ActionData = {
  error?: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // 이미 로그인되어 있으면 관리자 대시보드로 리디렉션
  const isLoggedIn = await isAdminLoggedIn(request, context.cloudflare.env);
  if (isLoggedIn) {
    throw redirect("/admin");
  }

  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString();

  if (!password) {
    return { error: "비밀번호를 입력해주세요." };
  }

  try {
    const result = await loginAdmin(request, password, context.cloudflare.env);

    if (result.error) {
      return { error: result.error };
    }

    if (result.success) {
      throw redirect("/admin", {
        headers: result.headers,
      });
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { error: "로그인 중 오류가 발생했습니다." };
  }

  return { error: "알 수 없는 오류가 발생했습니다." };
};

export default function AdminLogin() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">관리자 로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            포트폴리오 관리 페이지에 접근하려면 로그인이 필요합니다
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                관리자 비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              {actionData?.error && (
                <p className="mt-2 text-sm text-red-600">{actionData.error}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인
              </button>
            </div>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                메인 사이트로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 개발 환경에서만 표시되는 힌트 */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  개발 환경
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>wrangler.toml에 ADMIN_PASSWORD 환경변수를 설정하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
