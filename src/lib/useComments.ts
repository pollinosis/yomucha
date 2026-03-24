"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Comment, StreamInfo } from "@/types";

function generateId() {
  return Math.random().toString(36).slice(2);
}

// YouTube Live コメント取得フック
function useYouTubeComments(
  streamInfo: StreamInfo | null,
  onComment: (comment: Comment) => void,
  enabled: boolean
) {
  const liveChatIdRef = useRef<string | null>(null);
  const nextPageTokenRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    if (!streamInfo?.videoId) return;

    const params = new URLSearchParams({ videoId: streamInfo.videoId });
    if (liveChatIdRef.current) params.set("liveChatId", liveChatIdRef.current);
    if (nextPageTokenRef.current) params.set("pageToken", nextPageTokenRef.current);

    try {
      const res = await fetch(`/api/youtube?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      liveChatIdRef.current = data.liveChatId;
      nextPageTokenRef.current = data.nextPageToken;

      for (const item of data.items ?? []) {
        if (!seenIds.current.has(item.id) && item.text) {
          seenIds.current.add(item.id);
          onComment({
            id: item.id,
            author: item.author,
            text: item.text,
            timestamp: new Date(item.timestamp),
            service: "youtube",
          });
        }
      }

      const interval = data.pollingIntervalMillis ?? 5000;
      timerRef.current = setTimeout(poll, interval);
    } catch {
      timerRef.current = setTimeout(poll, 10000);
    }
  }, [streamInfo?.videoId, onComment]);

  useEffect(() => {
    if (!enabled || !streamInfo || streamInfo.service !== "youtube") return;
    liveChatIdRef.current = null;
    nextPageTokenRef.current = null;
    seenIds.current = new Set();
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, streamInfo, poll]);
}

// Twitch IRC WebSocket フック
function useTwitchComments(
  streamInfo: StreamInfo | null,
  onComment: (comment: Comment) => void,
  enabled: boolean
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !streamInfo || streamInfo.service !== "twitch" || !streamInfo.channelId) return;

    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      ws.send("PASS SCHMOOPIIE");
      ws.send(`NICK justinfan${Math.floor(Math.random() * 99999)}`);
      ws.send(`JOIN #${streamInfo.channelId!.toLowerCase()}`);
    };

    ws.onmessage = (event) => {
      const lines = (event.data as string).split("\r\n").filter(Boolean);
      for (const raw of lines) {
        if (raw.startsWith("PING")) {
          ws.send("PONG :tmi.twitch.tv");
          continue;
        }
        const privmsgMatch = raw.match(/^(?:@[^ ]+ )?:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.+)$/);
        if (privmsgMatch) {
          const [, username, message] = privmsgMatch;
          onComment({
            id: generateId(),
            author: username,
            text: message.trim(),
            timestamp: new Date(),
            service: "twitch",
          });
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [enabled, streamInfo, onComment]);
}

// TwitCasting コメント取得フック
function useTwitCastingComments(
  streamInfo: StreamInfo | null,
  onComment: (comment: Comment) => void,
  enabled: boolean
) {
  const movieIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    if (!streamInfo?.userId && !streamInfo?.movieId) return;

    const params = new URLSearchParams();
    // movieIdRef が確定したらそちらを使う（current_live 呼び出しをスキップ）
    const resolvedMovieId = movieIdRef.current ?? streamInfo.movieId;
    if (resolvedMovieId) {
      params.set("movieId", resolvedMovieId);
    } else {
      params.set("userId", streamInfo.userId!);
    }

    try {
      const res = await fetch(`/api/twitcasting?${params}`);
      if (!res.ok) {
        timerRef.current = setTimeout(poll, 10000);
        return;
      }
      const data = await res.json();
      if (data.movieId) movieIdRef.current = data.movieId;

      for (const item of data.items ?? []) {
        if (!seenIds.current.has(item.id) && item.text) {
          seenIds.current.add(item.id);
          onComment({
            id: item.id,
            author: item.author,
            text: item.text,
            timestamp: new Date(item.timestamp * 1000),
            service: "twitcasting",
          });
        }
      }

      // ライブ未配信中は長めの間隔でポーリング
      const interval = data.status === "not_live" ? 15000 : 5000;
      timerRef.current = setTimeout(poll, interval);
    } catch {
      timerRef.current = setTimeout(poll, 10000);
    }
  }, [streamInfo?.userId, streamInfo?.movieId, onComment]);

  useEffect(() => {
    if (!enabled || !streamInfo || streamInfo.service !== "twitcasting") return;
    movieIdRef.current = streamInfo.movieId ?? null;
    seenIds.current = new Set();
    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, streamInfo, poll]);
}

// メインのコメントフック
export function useComments(streamInfo: StreamInfo | null, enabled: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);

  const onComment = useCallback((comment: Comment) => {
    setComments((prev) => [...prev.slice(-199), comment]);
  }, []);

  useYouTubeComments(
    streamInfo?.service === "youtube" ? streamInfo : null,
    onComment,
    enabled
  );
  useTwitchComments(
    streamInfo?.service === "twitch" ? streamInfo : null,
    onComment,
    enabled
  );
  useTwitCastingComments(
    streamInfo?.service === "twitcasting" ? streamInfo : null,
    onComment,
    enabled
  );

  const clearComments = useCallback(() => setComments([]), []);

  return { comments, clearComments };
}
