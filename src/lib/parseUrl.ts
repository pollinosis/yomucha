import { StreamInfo } from "@/types";

export function parseStreamUrl(url: string): StreamInfo | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    // YouTube Live
    if (hostname === "youtube.com" || hostname === "youtu.be") {
      let videoId: string | null = null;
      if (hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1);
      } else {
        videoId = parsed.searchParams.get("v");
        if (!videoId) {
          // /live/{videoId} or /shorts/{videoId}
          const match = parsed.pathname.match(/\/(live|shorts)\/([^/?]+)/);
          if (match) videoId = match[2];
        }
      }
      if (!videoId) return null;
      return { service: "youtube", videoId, rawUrl: url };
    }

    // Twitch
    if (hostname === "twitch.tv") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length === 0) return null;
      const channelId = parts[0];
      return { service: "twitch", channelId, rawUrl: url };
    }

    // TwitCasting
    if (hostname === "twitcasting.tv") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length === 0) return null;
      const userId = parts[0];
      // /userId/movie/movieId
      const movieId = parts[1] === "movie" ? parts[2] : undefined;
      return { service: "twitcasting", userId, movieId, rawUrl: url };
    }

    return null;
  } catch {
    return null;
  }
}
