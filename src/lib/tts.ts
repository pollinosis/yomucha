import { TTSSettings } from "@/types";

export class TTSManager {
  private queue: string[] = [];
  private speaking = false;
  private settings: TTSSettings;
  // VOICEVOX は /api/tts 経由でサーバー側から呼び出す

  constructor(settings: TTSSettings) {
    this.settings = settings;
  }

  updateSettings(settings: TTSSettings) {
    this.settings = settings;
  }

  enqueue(text: string) {
    const trimmed = this.settings.maxLength > 0
      ? text.slice(0, this.settings.maxLength)
      : text;
    this.queue.push(trimmed);
    if (!this.speaking) {
      this.processNext();
    }
  }

  stop() {
    this.queue = [];
    if (this.settings.engine === "webspeech") {
      window.speechSynthesis.cancel();
    }
    this.speaking = false;
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.speaking = false;
      return;
    }
    this.speaking = true;
    const text = this.queue.shift()!;

    try {
      if (this.settings.engine === "voicevox") {
        await this.speakVoicevox(text);
      } else {
        await this.speakWebSpeech(text);
      }
    } catch {
      // fallback to Web Speech API
      try {
        await this.speakWebSpeech(text);
      } catch {
        // skip
      }
    }

    this.processNext();
  }

  private speakWebSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;
      utterance.lang = "ja-JP";
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private async speakVoicevox(text: string): Promise<void> {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        speaker: this.settings.voicevoxSpeaker,
        rate: this.settings.rate,
        volume: this.settings.volume,
      }),
    });
    if (!res.ok) throw new Error("VOICEVOX TTS failed");

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.volume = this.settings.volume;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.play();
    });
  }
}
