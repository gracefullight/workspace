import type { HeadlessShareOptions, ShareStrategy } from "@/types";

import { formatShareText } from "@/utils/text";
import { openShareWindow } from "@/utils/window";

export const whatsappStrategy: ShareStrategy = {
  share: (data, options) => {
    const { url, title, description } = data;
    const maxLength = options?.textMaxLength ?? 100;
    const phone = (options as HeadlessShareOptions | undefined)?.whatsapp?.phone;

    const shareText = formatShareText(title, description, url, {
      descriptionMaxLength: maxLength,
      formatText: options?.formatText,
    });

    const baseUrl = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    const shareUrl = `${baseUrl}?text=${encodeURIComponent(shareText)}`;
    openShareWindow(shareUrl);
  },
};
