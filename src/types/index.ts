export type StreamService = "youtube" | "twitch" | "twitcasting";

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  service: StreamService;
}

export interface StreamInfo {
  service: StreamService;
  channelId?: string;   // Twitch channel name
  videoId?: string;     // YouTube video ID
  movieId?: string;     // TwitCasting movie ID
  userId?: string;      // TwitCasting user ID
  rawUrl: string;
}

export type TTSEngine = "webspeech" | "voicevox";

export interface TTSSettings {
  engine: TTSEngine;
  rate: number;         // 0.5 - 2.0
  pitch: number;        // 0.0 - 2.0
  volume: number;       // 0.0 - 1.0
  voicevoxSpeaker: number; // VOICEVOX speaker ID
  readAuthor: boolean;  // コメント主の名前も読む
  maxLength: number;    // 最大読み上げ文字数 (0=無制限)
}
