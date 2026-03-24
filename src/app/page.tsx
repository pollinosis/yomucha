"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StreamForm from "@/components/StreamForm";
import CommentList from "@/components/CommentList";
import TTSSettingsPanel from "@/components/TTSSettings";
import { useComments } from "@/lib/useComments";
import { TTSManager } from "@/lib/tts";
import { Comment, StreamInfo, TTSSettings } from "@/types";

const DEFAULT_TTS_SETTINGS: TTSSettings = {
  engine: "webspeech",
  rate: 1.2,
  pitch: 1.0,
  volume: 0.9,
  voicevoxSpeaker: 0,
  readAuthor: false,
  maxLength: 50,
};

export default function Home() {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>(DEFAULT_TTS_SETTINGS);
  const [voicevoxAvailable, setVoicevoxAvailable] = useState(false);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const ttsManagerRef = useRef<TTSManager | null>(null);

  // VOICEVOX 可用性チェック（サーバー側APIを経由）
  useEffect(() => {
    fetch("/api/tts")
      .then((r) => r.json())
      .then((d) => { if (d.available) setVoicevoxAvailable(true); })
      .catch(() => {});
  }, []);

  // TTS Manager 初期化
  useEffect(() => {
    ttsManagerRef.current = new TTSManager(ttsSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TTS 設定変更を反映
  useEffect(() => {
    ttsManagerRef.current?.updateSettings(ttsSettings);
  }, [ttsSettings]);

  const { comments, clearComments } = useComments(streamInfo, isActive);
  const lastHandledId = useRef<string | null>(null);

  // 新しいコメントをTTSキューに追加
  useEffect(() => {
    if (!ttsEnabled || comments.length === 0) return;
    const latest = comments[comments.length - 1];
    if (latest.id === lastHandledId.current) return;
    lastHandledId.current = latest.id;

    setCurrentComment(latest);
    const text = ttsSettings.readAuthor
      ? `${latest.author}、${latest.text}`
      : latest.text;
    ttsManagerRef.current?.enqueue(text);
  }, [comments, ttsEnabled, ttsSettings.readAuthor]);

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
  }, []);

  const toggleTTS = () => {
    if (ttsEnabled) {
      ttsManagerRef.current?.stop();
    }
    setTtsEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            🎙️ よむちゃ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            YouTube Live / Twitch / ツイキャスのコメントを自動読み上げ
          </p>
        </div>

        {/* Stream URL Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <StreamForm
            onStart={handleStart}
            onStop={handleStop}
            isActive={isActive}
          />
        </div>

        {/* TTS Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-700">音声読み上げ</h2>
              <button
                onClick={toggleTTS}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  ttsEnabled ? "bg-indigo-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    ttsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              {showSettings ? "▲ 閉じる" : "▼ 詳細設定"}
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

          {showSettings && (
            <TTSSettingsPanel
              settings={ttsSettings}
              onChange={setTtsSettings}
              voicevoxAvailable={voicevoxAvailable}
            />
          )}
        </div>

        {/* Comment List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" style={{ height: "420px" }}>
          <CommentList
            comments={comments}
            currentComment={currentComment}
            onClear={clearComments}
          />
        </div>

        {/* Status Bar */}
        {isActive && (
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              接続中
              {streamInfo && (
                <span className="text-green-500">
                  — {streamInfo.service === "youtube" ? `YouTube (${streamInfo.videoId})` :
                    streamInfo.service === "twitch" ? `Twitch #${streamInfo.channelId}` :
                    `ツイキャス @${streamInfo.userId}`}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
