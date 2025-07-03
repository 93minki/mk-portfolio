import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import AdminLayout from "~/components/admin/AdminLayout";
import { logoutAdmin, requireAdmin } from "~/utils/auth";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // 모든 admin.* 라우트에서 자동으로 인증 체크
  await requireAdmin(request, context.cloudflare.env);
  return null;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "logout") {
    const result = await logoutAdmin(request, context.cloudflare.env);
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
