import { NextRequest, NextResponse } from "next/server";

const VOICEVOX_URL = process.env.VOICEVOX_URL ?? "http://localhost:50021";

export async function POST(req: NextRequest) {
  const { text, speaker } = await req.json();
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

// VOICEVOX が利用可能かチェック
export async function GET() {
  try {
    const res = await fetch(`${VOICEVOX_URL}/version`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const version = await res.text();
      return NextResponse.json({ available: true, version: version.trim() });
    }
    return NextResponse.json({ available: false });
  } catch {
    return NextResponse.json({ available: false });
  }
}
