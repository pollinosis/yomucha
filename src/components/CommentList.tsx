"use client";

import { useEffect, useRef } from "react";
import { Comment } from "@/types";

interface Props {
  comments: Comment[];
  currentComment: Comment | null;
  onClear: () => void;
}

const SERVICE_STYLES = {
  youtube: "border-l-red-400",
  twitch: "border-l-purple-400",
  twitcasting: "border-l-blue-400",
};

const SERVICE_LABELS = {
  youtube: "YT",
  twitch: "TW",
  twitcasting: "TC",
};

export default function CommentList({ comments, currentComment, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-600">
          コメント ({comments.length})
        </h2>
        {comments.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            クリア
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            コメントを待っています...
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-2 p-2 rounded-lg border-l-4 text-sm transition-all ${SERVICE_STYLES[comment.service]} ${
                currentComment?.id === comment.id
                  ? "bg-indigo-50 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <span className={`shrink-0 text-xs font-bold mt-0.5 ${
                comment.service === "youtube" ? "text-red-500" :
                comment.service === "twitch" ? "text-purple-500" :
                "text-blue-500"
              }`}>
                {SERVICE_LABELS[comment.service]}
              </span>
              <div className="min-w-0">
                <span className="font-semibold text-gray-700">{comment.author}</span>
                <span className="text-gray-400 mx-1">:</span>
                <span className="text-gray-800 break-words">{comment.text}</span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
