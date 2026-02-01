import type { ShareStrategy } from "@/types";

import { ensureKakaoInitialized } from "@/utils/kakao";

export const kakaoStrategy: ShareStrategy = {
  share: (data, options) => {
    const kakao = ensureKakaoInitialized(options?.kakao?.jsKey);
    if (!kakao) {
      throw new Error("Kakao SDK not initialized");
    }

    const { url, title, description, imageUrl } = data;
    const maxLength = options?.textMaxLength ?? 100;

    (
      kakao as unknown as { Share?: { sendDefault?: (options: unknown) => void } }
    ).Share?.sendDefault?.({
      buttons: [
        {
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
          title: options?.kakao?.buttonTitle || "View",
        },
      ],
      content: {
        description: description
          ? description.length > maxLength
            ? `${description.slice(0, maxLength)}...`
            : description
          : options?.kakao?.defaultDescription || "",
        imageUrl: imageUrl ?? "",
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
        title: title || "",
      },
      objectType: "feed",
    });
  },
};
