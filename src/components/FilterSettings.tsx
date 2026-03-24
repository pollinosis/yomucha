"use client";

import { useState } from "react";
import { FilterSettings } from "@/types";

interface Props {
  settings: FilterSettings;
  onChange: (settings: FilterSettings) => void;
}

function TagInput({
  label,
  placeholder,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const v = input.trim();
    if (v && !values.includes(v)) {
      onAdd(v);
      setInput("");
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          追加
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {v}
              <button
                onClick={() => onRemove(v)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSettingsPanel({ settings, onChange }: Props) {
  const addNgWord = (w: string) =>
    onChange({ ...settings, ngWords: [...settings.ngWords, w] });
  const removeNgWord = (w: string) =>
    onChange({ ...settings, ngWords: settings.ngWords.filter((x) => x !== w) });

  const addMuted = (u: string) =>
    onChange({ ...settings, mutedUsers: [...settings.mutedUsers, u] });
  const removeMuted = (u: string) =>
    onChange({ ...settings, mutedUsers: settings.mutedUsers.filter((x) => x !== u) });

  return (
    <div className="space-y-4">
      <TagInput
        label="NGワード"
        placeholder="スキップするワードを入力..."
        values={settings.ngWords}
        onAdd={addNgWord}
        onRemove={removeNgWord}
      />
      <TagInput
        label="ミュートユーザー"
        placeholder="ユーザー名を入力..."
        values={settings.mutedUsers}
        onAdd={addMuted}
        onRemove={removeMuted}
      />
    </div>
  );
}
