// 棒読みちゃん互換のテキスト前処理

// URLを除去
const URL_REGEX = /https?:\/\/\S+/g;
// 絵文字を除去
const EMOJI_REGEX = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
// Twitch/YouTube の絵文字コード（英数字のみの単語が連続する場合）
const EMOTE_REGEX = /\b[A-Z][a-zA-Z]+[A-Z]\b/g; // キャメルケース系絵文字

// @速い / @ゆっくり などのコマンド
const SPEED_COMMANDS: Record<string, number> = {
  "速い": 1.8,
  "はやい": 1.8,
  "早い": 1.8,
  "ゆっくり": 0.7,
  "遅い": 0.7,
  "おそい": 0.7,
  "普通": 1.0,
  "ふつう": 1.0,
};

export interface ProcessedText {
  text: string;
  rateOverride?: number;  // @速い などで上書きする速度
}

export function processBouyomiText(raw: string): ProcessedText {
  let text = raw;
  let rateOverride: number | undefined;

  // @コマンド を解析・除去
  text = text.replace(/@([^\s　]+)/g, (_, cmd) => {
    const speed = SPEED_COMMANDS[cmd];
    if (speed != null) {
      rateOverride = speed;
      return "";
    }
    return "";  // 不明な@コマンドも除去
  });

  // URL除去
  text = text.replace(URL_REGEX, "URL");

  // Unicode絵文字除去
  text = text.replace(EMOJI_REGEX, "");

  // 半角数字を読みやすく（3桁以上の数字はそのまま読む）
  // 例: 12345 → "いちにさんよんご" ではなく "12345" のまま（VOICEVOXが処理）

  // 連続する同じ文字を短縮（wwwww → w × 3回 など）
  text = text.replace(/([wWｗ])\1{2,}/g, "わらわら");
  text = text.replace(/([！!])\1{2,}/g, "！");
  text = text.replace(/([？?])\1{2,}/g, "？");

  // 空白の正規化
  text = text.replace(/\s+/g, " ").trim();

  return { text, rateOverride };
}
