import { db } from "~/lib/db.server";

const MAX_BYTES = 5 * 1024 * 1024;

type ImageMime = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

// 브라우저가 보낸 file.type은 조작할 수 있으므로 실제 바이트로 형식을 판별한다
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

export async function saveProfileImage(file: File): Promise<string | null> {
  if (file.size === 0) return "이미지 파일을 선택하세요.";
  if (file.size > MAX_BYTES) return "이미지는 5MB 이하만 올릴 수 있습니다.";
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectImageMime(bytes);
  if (!mime) return "PNG, JPEG, WebP, GIF 이미지만 올릴 수 있습니다.";
  db.prepare(
    "INSERT INTO profile_image (id, mime, data, version) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET mime = excluded.mime, data = excluded.data, version = excluded.version"
  ).run(mime, Buffer.from(bytes), Date.now());
  return null;
}

export function removeProfileImage() {
  db.prepare("DELETE FROM profile_image WHERE id = 1").run();
}

export function getProfileImageVersion(): number | null {
  const row = db.prepare("SELECT version FROM profile_image WHERE id = 1").get() as { version: number } | undefined;
  return row?.version ?? null;
}

export function getProfileImage() {
  return db.prepare("SELECT mime, data FROM profile_image WHERE id = 1").get() as { mime: string; data: Buffer } | undefined;
}
