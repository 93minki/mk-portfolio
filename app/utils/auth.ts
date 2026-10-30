import { createHash, timingSafeEqual } from "node:crypto";
import { createCookieSessionStorage, redirect } from "react-router";
import { env } from "~/lib/env.server";
import { clearLoginFailures, getClientKey, isLoginBlocked, recordLoginFailure } from "~/lib/login-rate-limit.server";

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
  const key = getClientKey(request);
  if (isLoginBlocked(key)) {
    return { error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.", blocked: true as const };
  }

  const passwordHash = createHash("sha256").update(password).digest();
  const adminPasswordHash = createHash("sha256").update(env.ADMIN_PASSWORD).digest();
  if (!timingSafeEqual(passwordHash, adminPasswordHash)) {
    recordLoginFailure(key);
    return { error: "비밀번호가 잘못되었습니다." };
  }
  clearLoginFailures(key);

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
