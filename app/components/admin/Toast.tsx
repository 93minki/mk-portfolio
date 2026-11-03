import { useEffect, useState } from "react";

export type Notice = { tone: "success" | "error"; message: string };

export default function Toast({ notice }: { notice: Notice | null }) {
  const [dismissed, setDismissed] = useState<Notice | null>(null);
  const shown = notice === dismissed ? null : notice;

  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = setTimeout(() => setDismissed(notice), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!shown) return null;

  return (
    <div
      role={shown.tone === "success" ? "status" : "alert"}
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-50 flex items-start justify-between gap-4 rounded-lg border p-4 shadow-lg ${
        shown.tone === "success"
          ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300"
          : "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"
      }`}
    >
      <p>{shown.message}</p>
      <button type="button" aria-label="알림 닫기" onClick={() => setDismissed(notice)}>
        ×
      </button>
    </div>
  );
}
