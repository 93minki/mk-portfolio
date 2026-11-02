import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // 터널 뒤의 앱은 http로 요청을 받아 https Origin을 다른 출처로 판단한다
  allowedActionOrigins: ["93minki.dev"],
} satisfies Config;
