import { NextRequest, NextResponse } from "next/server";

const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export async function GET(req: NextRequest) {
  if (!YT_API_KEY) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY not configured" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const videoId = searchParams.get("videoId");
  const pageToken = searchParams.get("pageToken");

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  // liveChatId を取得
  let liveChatId = searchParams.get("liveChatId");
  if (!liveChatId) {
    const videoRes = await fetch(
      `${BASE}/videos?part=liveStreamingDetails&id=${videoId}&key=${YT_API_KEY}`
    );
    const videoData = await videoRes.json();
    liveChatId = videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
    if (!liveChatId) {
      return NextResponse.json({ error: "No active live chat found" }, { status: 404 });
    }
  }

  // コメント取得
  const url = new URL(`${BASE}/liveChat/messages`);
  url.searchParams.set("liveChatId", liveChatId);
  url.searchParams.set("part", "snippet,authorDetails");
  url.searchParams.set("key", YT_API_KEY);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const chatRes = await fetch(url.toString());
  const chatData = await chatRes.json();

  return NextResponse.json({
    liveChatId,
    nextPageToken: chatData.nextPageToken,
    pollingIntervalMillis: chatData.pollingIntervalMillis ?? 5000,
    items: (chatData.items ?? []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>;
      const authorDetails = item.authorDetails as Record<string, unknown>;
      return {
        id: item.id,
        author: authorDetails?.displayName ?? "Unknown",
        text: (snippet?.textMessageDetails as Record<string, unknown>)?.messageText ?? "",
        timestamp: snippet?.publishedAt,
      };
    }),
  });
}
