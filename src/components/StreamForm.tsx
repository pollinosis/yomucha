"use client";

import { useState } from "react";
import { StreamInfo } from "@/types";
import { parseStreamUrl } from "@/lib/parseUrl";

interface Props {
  onStart: (info: StreamInfo) => void;
  onStop: () => void;
  isActive: boolean;
}

const SERVICE_LABELS = {
  youtube: { label: "YouTube Live", color: "bg-red-100 text-red-700 border-red-200" },
  twitch: { label: "Twitch", color: "bg-purple-100 text-purple-700 border-purple-200" },
  twitcasting: { label: "ツイキャス", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const EXAMPLES = [
  "https://www.youtube.com/watch?v=VIDEO_ID",
  "https://www.twitch.tv/CHANNEL_NAME",
  "https://twitcasting.tv/USER_ID",
];

export default function StreamForm({ onStart, onStop, isActive }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<StreamInfo | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");
    const info = parseStreamUrl(value);
    setPreview(info);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isActive) {
      onStop();
      return;
    }
    const info = parseStreamUrl(url);
    if (!info) {
      setError("URLを認識できませんでした。YouTube Live / Twitch / ツイキャスのURLを入力してください。");
      return;
    }
    onStart(info);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="配信URLを入力..."
            disabled={isActive}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
          />
          {preview && (
            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full border ${SERVICE_LABELS[preview.service].color}`}>
              {SERVICE_LABELS[preview.service].label}
            </span>
          )}
        </div>
        <button
          type="submit"
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
            isActive
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          }`}
          disabled={!isActive && !url}
        >
          {isActive ? "停止" : "開始"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isActive && !url && (
        <div className="text-xs text-gray-400 space-y-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleUrlChange(ex)}
              className="block text-indigo-400 hover:underline truncate"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
