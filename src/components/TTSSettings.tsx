"use client";

import { useEffect, useState } from "react";
import { TTSSettings, TTSEngine } from "@/types";

interface Speaker {
  id: number;
  name: string;
}

interface Props {
  settings: TTSSettings;
  onChange: (settings: TTSSettings) => void;
  voicevoxAvailable: boolean;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-gray-600 w-14 shrink-0">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 accent-indigo-500"
      />
      <span className="text-xs text-gray-500 w-10 text-right">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

export default function TTSSettingsPanel({ settings, onChange, voicevoxAvailable }: Props) {
  const update = (partial: Partial<TTSSettings>) => onChange({ ...settings, ...partial });
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    if (!voicevoxAvailable) return;
    fetch("/api/tts?speakers=1")
      .then((r) => r.json())
      .then((d) => { if (d.speakers) setSpeakers(d.speakers); })
      .catch(() => {});
  }, [voicevoxAvailable]);

  return (
    <div className="space-y-3">
      {/* エンジン選択 */}
      <div className="flex gap-2">
        {(["webspeech", "voicevox"] as TTSEngine[]).map((engine) => (
          <button
            key={engine}
            onClick={() => update({ engine })}
            disabled={engine === "voicevox" && !voicevoxAvailable}
            className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
              settings.engine === engine
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {engine === "webspeech" ? "Web Speech" : "VOICEVOX"}
            {engine === "voicevox" && !voicevoxAvailable && (
              <span className="ml-1 text-gray-400">(未起動)</span>
            )}
          </button>
        ))}
      </div>

      {/* VOICEVOX 話者選択 */}
      {settings.engine === "voicevox" && voicevoxAvailable && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-600 w-14 shrink-0">話者</label>
          {speakers.length > 0 ? (
            <select
              value={settings.voicevoxSpeaker}
              onChange={(e) => update({ voicevoxSpeaker: parseInt(e.target.value) })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
            >
              {speakers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-gray-400">読み込み中...</span>
          )}
        </div>
      )}

      {/* スライダー */}
      <Slider
        label="速度"
        value={settings.rate}
        min={0.5}
        max={2.0}
        step={0.1}
        onChange={(v) => update({ rate: v })}
        format={(v) => `${v.toFixed(1)}x`}
      />
      <Slider
        label="音量"
        value={settings.volume}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => update({ volume: v })}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      {/* その他設定 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="readAuthor"
          checked={settings.readAuthor}
          onChange={(e) => update({ readAuthor: e.target.checked })}
          className="accent-indigo-500"
        />
        <label htmlFor="readAuthor" className="text-xs text-gray-600 cursor-pointer">
          名前も読み上げる
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-600 w-14 shrink-0">最大文字</label>
        <input
          type="number"
          min={0}
          value={settings.maxLength}
          onChange={(e) => update({ maxLength: parseInt(e.target.value) || 0 })}
          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
        />
        <span className="text-xs text-gray-400">文字 (0=無制限)</span>
      </div>
    </div>
  );
}
