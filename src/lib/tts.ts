import { TTSSettings } from "@/types";

interface QueueItem {
  text: string;
  rateOverride?: number;
}

export class TTSManager {
  private queue: QueueItem[] = [];
  private speaking = false;
  private settings: TTSSettings;
  private onQueueChange?: (texts: string[]) => void;

  constructor(settings: TTSSettings, onQueueChange?: (texts: string[]) => void) {
    this.settings = settings;
    this.onQueueChange = onQueueChange;
  }

  updateSettings(settings: TTSSettings) {
    this.settings = settings;
  }

  enqueue(text: string, rateOverride?: number) {
    const trimmed = this.settings.maxLength > 0
      ? text.slice(0, this.settings.maxLength)
      : text;
    this.queue.push({ text: trimmed, rateOverride });
    this.notifyQueue();
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
    this.notifyQueue();
  }

  private notifyQueue() {
    this.onQueueChange?.(this.queue.map((q) => q.text));
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.speaking = false;
      this.notifyQueue();
      return;
    }
    this.speaking = true;
    const item = this.queue.shift()!;
    this.notifyQueue();

    const rate = item.rateOverride ?? this.settings.rate;

    try {
      if (this.settings.engine === "voicevox") {
        await this.speakVoicevox(item.text, rate);
      } else {
        await this.speakWebSpeech(item.text, rate);
      }
    } catch {
      try {
        await this.speakWebSpeech(item.text, rate);
      } catch {
        // skip
      }
    }

    this.processNext();
  }

  private speakWebSpeech(text: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;
      utterance.lang = "ja-JP";
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private async speakVoicevox(text: string, rate: number): Promise<void> {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        speaker: this.settings.voicevoxSpeaker,
        rate,
        volume: this.settings.volume,
      }),
    });
    if (!res.ok) throw new Error("VOICEVOX TTS failed");

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.volume = this.settings.volume;
      audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.play();
    });
  }
}
