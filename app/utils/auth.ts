import { createCookieSessionStorage, redirect } from "react-router";
import { env } from "~/lib/env.server";

// 세션 쿠키 설정
export function createAuthSessionStorage() {
  return createCookieSessionStorage({
    cookie: {
      name: "__admin_session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
      sameSite: "lax",
      secrets: [env.SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
  });
}

// 관리자 인증 체크
export async function requireAdmin(request: Request) {
  const sessionStorage = createAuthSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const isAdmin = session.get("isAdmin");

  if (!isAdmin) {
    throw redirect("/admin/login");
  }

  return session;
}

// 로그인 처리
export async function loginAdmin(request: Request, password: string) {
  const adminPassword = env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return { error: "비밀번호가 잘못되었습니다." };
  }

  const sessionStorage = createAuthSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  session.set("isAdmin", true);

  const cookieHeader = await sessionStorage.commitSession(session);

  return {
    success: true,
    headers: {
      "Set-Cookie": cookieHeader,
    },
  };
}

// 로그아웃 처리
export async function logoutAdmin(request: Request) {
  const sessionStorage = createAuthSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  };
}

// 현재 관리자 상태 확인 (리디렉션 없이)
export async function isAdminLoggedIn(
  request: Request
): Promise<boolean> {
  try {
    const sessionStorage = createAuthSessionStorage();
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    return session.get("isAdmin") === true;
  } catch {
    return false;
  }
}
