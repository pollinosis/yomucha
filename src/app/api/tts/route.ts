import { NextRequest, NextResponse } from "next/server";

const VOICEVOX_URL = process.env.VOICEVOX_URL ?? "http://localhost:50021";

export async function POST(req: NextRequest) {
  const { text, speaker, rate, volume } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    // audio_query
    const queryRes = await fetch(
      `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker ?? 0}`,
      { method: "POST" }
    );
    if (!queryRes.ok) {
      return NextResponse.json({ error: "VOICEVOX audio_query failed" }, { status: 502 });
    }
    const query = await queryRes.json();

    // 速度・音量を適用
    if (rate != null) query.speedScale = rate;
    if (volume != null) query.volumeScale = volume;

    // synthesis
    const synthRes = await fetch(
      `${VOICEVOX_URL}/synthesis?speaker=${speaker ?? 0}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      }
    );
    if (!synthRes.ok) {
      return NextResponse.json({ error: "VOICEVOX synthesis failed" }, { status: 502 });
    }

    const audioBuffer = await synthRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "VOICEVOX unavailable" }, { status: 503 });
  }
}

// VOICEVOX 可用性チェック＆話者一覧取得
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  try {
    const versionRes = await fetch(`${VOICEVOX_URL}/version`, { signal: AbortSignal.timeout(2000) });
    if (!versionRes.ok) return NextResponse.json({ available: false });

    // 話者一覧が必要な場合
    if (searchParams.get("speakers") === "1") {
      const speakersRes = await fetch(`${VOICEVOX_URL}/speakers`);
      const speakers = await speakersRes.json();
      // { id, name } の平坦なリストに整形（スタイルごと）
      const list = speakers.flatMap((s: { name: string; styles: { id: number; name: string }[] }) =>
        s.styles.map((style) => ({
          id: style.id,
          name: `${s.name}（${style.name}）`,
        }))
      );
      return NextResponse.json({ available: true, speakers: list });
    }

    const version = await versionRes.text();
    return NextResponse.json({ available: true, version: version.trim() });
  } catch {
    return NextResponse.json({ available: false });
  }
}
