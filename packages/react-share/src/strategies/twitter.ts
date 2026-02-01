import type { ShareStrategy } from "@/types";

import { formatTweetText } from "@/utils/text";
import { openShareWindow } from "@/utils/window";

export const twitterStrategy: ShareStrategy = {
  share: (data, options) => {
    const { url, title, description } = data;
    const twitterLimit = options?.textMaxLength ?? 60;

    const tweetText = formatTweetText(title, description, {
      descriptionMaxLength: twitterLimit,
      formatText: options?.formatText,
    });

    const params = new URLSearchParams();
    params.set("text", tweetText);
    params.set("url", url);

    // Add Twitter-specific options
    if (options?.twitter?.hashtags?.length) {
      params.set("hashtags", options.twitter.hashtags.join(","));
    }
    if (options?.twitter?.via) {
      params.set("via", options.twitter.via);
    }
    if (options?.twitter?.related?.length) {
      params.set("related", options.twitter.related.join(","));
    }

    const shareUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
    openShareWindow(shareUrl);
  },
};
