import { getProfileImage } from "~/lib/profile-image.server";

export const loader = () => {
  const image = getProfileImage();
  if (!image) throw new Response("Not Found", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      // URL에 ?v=<version>이 붙으므로 이미지가 바뀌면 주소도 바뀐다
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
