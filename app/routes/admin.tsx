import type { ActionFunctionArgs } from "react-router";
import type { Route } from "./+types/admin";
import { redirect , Outlet } from "react-router";
import AdminLayout from "~/components/admin/AdminLayout";
import { logoutAdmin, requireAdmin } from "~/utils/auth";

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request }) => {
    await requireAdmin(request);
  },
];

// 하위 라우트에 loader가 없어도 클라이언트 이동 시 middleware가 실행되도록 유지한다
export const loader = () => null;

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "logout") {
    const result = await logoutAdmin(request);
    throw redirect("/", {
      headers: result.headers,
    });
  }

  return null;
};

export default function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
