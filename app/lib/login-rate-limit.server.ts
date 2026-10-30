const failures = new Map<string, { failures: number; resetAt: number }>();
const limit = 5;
const windowMs = 15 * 60 * 1000;

export function getClientKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

export function isLoginBlocked(key: string, now = Date.now()): boolean {
  const entry = failures.get(key);
  return !!entry && entry.resetAt > now && entry.failures >= limit;
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  for (const [client, entry] of failures) {
    if (entry.resetAt <= now) failures.delete(client);
  }

  const entry = failures.get(key);
  if (entry) {
    entry.failures++;
  } else {
    failures.set(key, { failures: 1, resetAt: now + windowMs });
  }
}

export function clearLoginFailures(key: string): void {
  failures.delete(key);
}
