"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import StreamForm from "@/components/StreamForm";
import CommentList from "@/components/CommentList";
import TTSSettingsPanel from "@/components/TTSSettings";
import FilterSettingsPanel from "@/components/FilterSettings";
import { useComments } from "@/lib/useComments";
import { TTSManager } from "@/lib/tts";
import { processBouyomiText } from "@/lib/bouyomi";
import { Comment, StreamInfo, TTSSettings, FilterSettings } from "@/types";

const DEFAULT_TTS_SETTINGS: TTSSettings = {
  engine: "webspeech",
  rate: 1.2,
  pitch: 1.0,
  volume: 0.9,
  voicevoxSpeaker: 0,
  readAuthor: false,
  maxLength: 50,
};

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  ngWords: [],
  mutedUsers: [],
};

type SettingsTab = "tts" | "filter";

export default function Home() {
  const { data: session, status } = useSession();
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>(DEFAULT_TTS_SETTINGS);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [voicevoxAvailable, setVoicevoxAvailable] = useState(false);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("tts");
  const [queue, setQueue] = useState<string[]>([]);

  const ttsManagerRef = useRef<TTSManager | null>(null);
  const settingsSavedRef = useRef(false);

  // VOICEVOX 可用性チェック
  useEffect(() => {
    fetch("/api/tts")
      .then((r) => r.json())
      .then((d) => { if (d.available) setVoicevoxAvailable(true); })
      .catch(() => {});
  }, []);

  // TTS Manager 初期化
  useEffect(() => {
    ttsManagerRef.current = new TTSManager(ttsSettings, setQueue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TTS 設定変更を反映
  useEffect(() => {
    ttsManagerRef.current?.updateSettings(ttsSettings);
  }, [ttsSettings]);

  // ログイン時に設定を読み込む
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setTtsSettings((prev) => ({
            ...prev,
            engine: d.ttsEngine ?? prev.engine,
            rate: d.ttsRate ?? prev.rate,
            volume: d.ttsVolume ?? prev.volume,
            voicevoxSpeaker: d.voicevoxSpeaker ?? prev.voicevoxSpeaker,
            readAuthor: d.readAuthor ?? prev.readAuthor,
            maxLength: d.maxLength ?? prev.maxLength,
          }));
          setFilterSettings({
            ngWords: d.ngWords ?? [],
            mutedUsers: d.mutedUsers ?? [],
          });
        }
      })
      .catch(() => {});
  }, [status]);

  // 設定変更時に自動保存（ログイン時のみ）
  const saveSettings = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ttsEngine: ttsSettings.engine,
        ttsRate: ttsSettings.rate,
        ttsVolume: ttsSettings.volume,
        voicevoxSpeaker: ttsSettings.voicevoxSpeaker,
        readAuthor: ttsSettings.readAuthor,
        maxLength: ttsSettings.maxLength,
        ngWords: filterSettings.ngWords,
        mutedUsers: filterSettings.mutedUsers,
      }),
    }).catch(() => {});
  }, [status, ttsSettings, filterSettings]);

  useEffect(() => {
    if (!settingsSavedRef.current) { settingsSavedRef.current = true; return; }
    const timer = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timer);
  }, [saveSettings]);

  const { comments, clearComments } = useComments(streamInfo, isActive);
  const lastHandledId = useRef<string | null>(null);

  // フィルター判定
  const shouldSkip = useCallback((comment: Comment): boolean => {
    if (filterSettings.mutedUsers.some((u) =>
      u.toLowerCase() === comment.author.toLowerCase()
    )) return true;
    if (filterSettings.ngWords.some((w) =>
      comment.text.toLowerCase().includes(w.toLowerCase())
    )) return true;
    return false;
  }, [filterSettings]);

  // 新しいコメントをTTSキューに追加
  useEffect(() => {
    if (!ttsEnabled || comments.length === 0) return;
    const latest = comments[comments.length - 1];
    if (latest.id === lastHandledId.current) return;
    lastHandledId.current = latest.id;

    if (shouldSkip(latest)) return;

    setCurrentComment(latest);
    const rawText = ttsSettings.readAuthor
      ? `${latest.author}、${latest.text}`
      : latest.text;

    const { text, rateOverride } = processBouyomiText(rawText);
    if (!text) return;

    ttsManagerRef.current?.enqueue(text, rateOverride);
  }, [comments, ttsEnabled, ttsSettings.readAuthor, shouldSkip]);

  const handleStart = useCallback((info: StreamInfo) => {
    setStreamInfo(info);
    setIsActive(true);
    clearComments();
    lastHandledId.current = null;
    setCurrentComment(null);
  }, [clearComments]);

  const handleStop = useCallback(() => {
    setIsActive(false);
    ttsManagerRef.current?.stop();
    setCurrentComment(null);
    setQueue([]);
  }, []);

  const toggleTTS = () => {
    if (ttsEnabled) ttsManagerRef.current?.stop();
    setTtsEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">🎙️ よむちゃ</h1>
            <p className="text-xs text-gray-500 mt-0.5">YouTube Live / Twitch / ツイキャス</p>
          </div>
          <div>
            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <img src={session.user.image} className="w-7 h-7 rounded-full" alt="" />
                )}
                <span className="text-xs text-gray-600">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("discord")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2] text-white text-xs font-medium rounded-lg hover:bg-[#4752C4] transition-colors"
              >
                Discordでログイン
              </button>
            )}
          </div>
        </div>

        {/* Stream URL Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <StreamForm onStart={handleStart} onStop={handleStop} isActive={isActive} />
        </div>

        {/* TTS Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-700">音声読み上げ</h2>
              <button
                onClick={toggleTTS}
                className={`relative w-10 h-5 rounded-full transition-colors ${ttsEnabled ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ttsEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              {showSettings ? "▲ 閉じる" : "▼ 設定"}
            </button>
          </div>

          {/* 現在読み上げ中 */}
          {currentComment && ttsEnabled && (
            <div className="bg-indigo-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-indigo-400 text-xs font-semibold">読み上げ中 ▶</span>
              <p className="text-gray-700 mt-0.5">
                <span className="font-semibold">{currentComment.author}</span>
                <span className="text-gray-400 mx-1">:</span>
                {currentComment.text}
              </p>
            </div>
          )}

          {/* キュー表示 */}
          {queue.length > 0 && (
            <div className="text-xs text-gray-400">
              待機中: {queue.length}件
              {queue.slice(0, 3).map((t, i) => (
                <span key={i} className="ml-2 text-gray-300 truncate">{t.slice(0, 15)}…</span>
              ))}
            </div>
          )}

          {showSettings && (
            <div className="space-y-3">
              {/* タブ */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {([["tts", "音声"], ["filter", "フィルター"]] as [SettingsTab, string][]).map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                      settingsTab === tab ? "bg-white text-gray-700 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {settingsTab === "tts" ? (
                <TTSSettingsPanel
                  settings={ttsSettings}
                  onChange={setTtsSettings}
                  voicevoxAvailable={voicevoxAvailable}
                />
              ) : (
                <FilterSettingsPanel
                  settings={filterSettings}
                  onChange={setFilterSettings}
                />
              )}

              {status === "authenticated" && (
                <p className="text-xs text-green-600 text-right">✓ 設定は自動保存されます</p>
              )}
              {status === "unauthenticated" && (
                <p className="text-xs text-gray-400 text-right">
                  <button onClick={() => signIn("discord")} className="text-indigo-400 hover:underline">
                    Discordでログイン
                  </button>
                  すると設定が保存されます
                </p>
              )}
            </div>
          )}
        </div>

        {/* Comment List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" style={{ height: "420px" }}>
          <CommentList comments={comments} currentComment={currentComment} onClear={clearComments} />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <a href="/licenses" className="hover:text-gray-600 hover:underline">
            ライセンス・クレジット
          </a>
        </div>

        {/* Status Bar */}
        {isActive && (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              接続中 —{" "}
              {streamInfo?.service === "youtube" ? `YouTube (${streamInfo.videoId})` :
               streamInfo?.service === "twitch" ? `Twitch #${streamInfo.channelId}` :
               `ツイキャス @${streamInfo?.userId}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
