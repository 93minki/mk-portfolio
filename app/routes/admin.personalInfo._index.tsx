import { useMemo, type ReactNode } from "react";
import Toast, { type Notice } from "~/components/admin/Toast";
import { db } from "~/lib/db.server";
import { getProfileImageVersion, removeProfileImage, saveProfileImage } from "~/lib/profile-image.server";
import { ActionFunctionArgs, Form, Link, useActionData, useLoaderData } from "react-router";
import type { PersonalInfo } from "~/types/personal_info";

const INFO_FIELDS = ["name", "title", "hero_title", "bio", "email", "github", "velog", "location"] as const;

export const loader = async () => {
  const rows = db.prepare("SELECT * FROM personal_info").all() as PersonalInfo[];
  const personalInfo = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, string>;
  return { personalInfo, profileImageVersion: getProfileImageVersion() };
};

type ActionData = {
  success?: boolean;
  error?: string;
  action?: "save-info" | "upload-image" | "remove-image";
};

const upsertInfo = db.transaction((formData: FormData) => {
  const statement = db.prepare(`
    INSERT INTO personal_info (key, value, created_at, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);
  for (const field of INFO_FIELDS) {
    statement.run(field, (formData.get(field)?.toString() || "").replace(/\r\n?/g, "\n"));
  }
});

export const action = async ({ request }: ActionFunctionArgs): Promise<ActionData> => {
  const formData = await request.formData();
  const action = formData.get("_action");

  try {
    if (action === "save-info") {
      upsertInfo(formData);
      return { success: true, action };
    }
    if (action === "upload-image") {
      const file = formData.get("image");
      if (!(file instanceof File)) return { error: "이미지 파일을 선택하세요." };
      const error = await saveProfileImage(file);
      return error ? { error } : { success: true, action };
    }
    if (action === "remove-image") {
      removeProfileImage();
      return { success: true, action };
    }
    return { error: "올바르지 않은 요청입니다." };
  } catch {
    return { error: "개인정보 업데이트 중 오류가 발생했습니다." };
  }
};

const SUCCESS_MESSAGES = {
  "save-info": "개인정보가 성공적으로 업데이트되었습니다!",
  "upload-image": "프로필 이미지가 변경되었습니다.",
  "remove-image": "프로필 이미지가 삭제되었습니다.",
};

const inputClass =
  "p-4 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-xs border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

function CurrentLink({ href, value }: { href?: string; value?: string }) {
  if (!value) return <>현재: 설정 안 됨</>;
  const external = !href?.startsWith("mailto:");
  return (
    <>
      현재:{" "}
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 underline break-all"
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {value}
      </a>
    </>
  );
}

export default function PersonalInfoPage() {
  const { personalInfo, profileImageVersion } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const notice = useMemo<Notice | null>(() => {
    if (actionData?.success && actionData.action) return { tone: "success", message: SUCCESS_MESSAGES[actionData.action] };
    if (actionData?.error) return { tone: "error", message: actionData.error };
    return null;
  }, [actionData]);

  const name = personalInfo.name || "";
  const defaultHeroTitle = `안녕하세요, ${name || "이름"}입니다`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">개인정보 관리</h1>
          <p className="text-gray-600 dark:text-gray-400">포트폴리오 개인정보를 관리하세요</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          대시보드로 이동
        </Link>
      </div>

      <Toast notice={notice} />

      <div className="space-y-8">
        <Section title="프로필 이미지">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {profileImageVersion ? (
              <img
                src={`/profile-image?v=${profileImageVersion}`}
                alt="현재 프로필 이미지"
                className="w-24 h-24 rounded-full object-cover shadow-lg shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <Form key={profileImageVersion ?? "none"} method="post" encType="multipart/form-data" className="space-y-3">
                <input type="hidden" name="_action" value="upload-image" />
                <Field id="image" label="이미지 파일" hint="PNG, JPEG, WebP, GIF · 5MB 이하">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    required
                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                  />
                </Field>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  이미지 업로드
                </button>
              </Form>
              {profileImageVersion && (
                <Form method="post">
                  <input type="hidden" name="_action" value="remove-image" />
                  <button
                    type="submit"
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    onClick={(e) => {
                      if (!confirm("프로필 이미지를 삭제하시겠습니까?")) e.preventDefault();
                    }}
                  >
                    이미지 삭제
                  </button>
                </Form>
              )}
            </div>
          </div>
        </Section>

        <Form method="post" className="space-y-8">
          <input type="hidden" name="_action" value="save-info" />

          <Section title="소개 문구">
            <Field
              id="hero_title"
              label="타이틀"
              hint="비워두면 기본 문구가 표시됩니다. 타이틀 안의 이름은 강조 색으로 표시됩니다."
            >
              <input
                type="text"
                id="hero_title"
                name="hero_title"
                defaultValue={personalInfo.hero_title || ""}
                className={inputClass}
                placeholder={defaultHeroTitle}
              />
            </Field>
            <Field id="bio" label="서브타이틀">
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={personalInfo.bio || ""}
                className={`${inputClass} field-sizing-content min-h-32 resize-y`}
                placeholder="사용자 경험을 중시하는 Frontend Developer입니다..."
              />
            </Field>
          </Section>

          <Section title="기본 정보">
            <Field id="name" label="이름 *">
              <input type="text" id="name" name="name" defaultValue={name} className={inputClass} placeholder="김민기" required />
            </Field>
            <Field id="title" label="직책">
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={personalInfo.title || ""}
                className={inputClass}
                placeholder="Frontend Developer"
              />
            </Field>
            <Field id="location" label="위치">
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={personalInfo.location || ""}
                className={inputClass}
                placeholder="Seoul, South Korea"
              />
            </Field>
          </Section>

          <Section title="연락처·링크">
            <Field id="email" label="이메일" hint={<CurrentLink href={`mailto:${personalInfo.email}`} value={personalInfo.email} />}>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={personalInfo.email || ""}
                className={inputClass}
                placeholder="your-email@example.com"
              />
            </Field>
            <Field id="github" label="GitHub URL" hint={<CurrentLink href={personalInfo.github} value={personalInfo.github} />}>
              <input
                type="url"
                id="github"
                name="github"
                defaultValue={personalInfo.github || ""}
                className={inputClass}
                placeholder="https://github.com/username"
              />
            </Field>
            <Field id="velog" label="Velog URL" hint={<CurrentLink href={personalInfo.velog} value={personalInfo.velog} />}>
              <input
                type="url"
                id="velog"
                name="velog"
                defaultValue={personalInfo.velog || ""}
                className={inputClass}
                placeholder="https://velog.io/@username"
              />
            </Field>
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              개인정보 수정하기
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
