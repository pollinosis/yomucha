import { NextRequest, NextResponse } from "next/server";

const TC_CLIENT_ID = process.env.TWITCASTING_CLIENT_ID;
const TC_CLIENT_SECRET = process.env.TWITCASTING_CLIENT_SECRET;
const BASE = "https://apiv2.twitcasting.tv";

async function tcFetch(path: string) {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Api-Version": "2.0",
  };

  if (TC_CLIENT_ID && TC_CLIENT_SECRET) {
    const creds = Buffer.from(`${TC_CLIENT_ID}:${TC_CLIENT_SECRET}`).toString("base64");
    headers["Authorization"] = `Basic ${creds}`;
  }

  return fetch(`${BASE}${path}`, { headers });
}

// ユーザーの最新ライブムービーIDを取得
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const movieId = searchParams.get("movieId");

  if (!userId && !movieId) {
    return NextResponse.json({ error: "userId or movieId required" }, { status: 400 });
  }

  // movieId がなければユーザーの現在のライブを取得
  let currentMovieId = movieId;
  if (!currentMovieId && userId) {
    const res = await tcFetch(`/users/${userId}/current_live`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json({ movieId: null, items: [], status: "not_live", _debug: { httpStatus: res.status, body: errBody } });
    }
    const data = await res.json();
    currentMovieId = data.movie?.id;
    if (!currentMovieId) {
      return NextResponse.json({ movieId: null, items: [], status: "not_live", _debug: { data } });
    }
  }

  // コメント取得（最新50件、降順で取得してクライアント側で既読管理）
  const commentUrl = new URL(`${BASE}/movies/${currentMovieId}/comments`);
  commentUrl.searchParams.set("limit", "50");

  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Api-Version": "2.0",
  };
  if (TC_CLIENT_ID && TC_CLIENT_SECRET) {
    const creds = Buffer.from(`${TC_CLIENT_ID}:${TC_CLIENT_SECRET}`).toString("base64");
    headers["Authorization"] = `Basic ${creds}`;
  }

  const commentRes = await fetch(commentUrl.toString(), { headers });
  const commentData = await commentRes.json();

  return NextResponse.json({
    movieId: currentMovieId,
    items: (commentData.comments ?? []).map((c: Record<string, unknown>) => ({
      id: String(c.id),
      author: (c.from_user as Record<string, unknown>)?.screen_id ?? "unknown",
      text: c.message ?? "",
      timestamp: c.created,
    })),
  });
}
