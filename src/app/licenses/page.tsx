export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <a href="/" className="text-sm text-indigo-500 hover:underline">← よむちゃに戻る</a>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">ライセンス・クレジット</h1>
        </div>

        {/* VOICEVOX */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">音声合成エンジン</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              本サービスでは音声合成に{" "}
              <a href="https://voicevox.hiroshiba.jp/" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
                VOICEVOX
              </a>{" "}
              を使用しています。
            </p>
            <p>
              VOICEVOX ENGINE は{" "}
              <a href="https://github.com/VOICEVOX/voicevox_engine/blob/master/LICENSE" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
                LGPL-3.0
              </a>{" "}
              ライセンスのもとで配布されています。
            </p>
          </div>
        </section>

        {/* VOICEVOX キャラクター */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">VOICEVOX キャラクター</h2>
          <p className="text-sm text-gray-500">
            VOICEVOXの音声ライブラリを使用して生成した音声には、各キャラクターの利用規約が適用されます。
            本サービスで音声を生成する際は「VOICEVOX:キャラクター名」のクレジットが必要です。
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { name: "四国めたん", url: "https://zunko.jp/con_ongen_kiyaku.html" },
              { name: "ずんだもん", url: "https://zunko.jp/con_ongen_kiyaku.html" },
              { name: "春日部つむぎ", url: "https://tsukushinyoki10.wixsite.com/ktsumugiofficial/利用規約" },
              { name: "雨晴はう", url: "https://amehau.com/" },
              { name: "波音リツ", url: "http://canon-voice.com/kiyaku.html" },
              { name: "玄野武宏", url: "https://voiced.jp/voicevox_kiyaku" },
              { name: "白上虎太郎", url: "https://voiced.jp/voicevox_kiyaku" },
              { name: "青山龍星", url: "https://voiced.jp/voicevox_kiyaku" },
              { name: "冥鳴ひまり", url: "https://meimeihimari.wixsite.com/himari/terms-of-use" },
              { name: "九州そら", url: "https://zunko.jp/con_ongen_kiyaku.html" },
            ].map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-gray-700"
              >
                <span>VOICEVOX:{c.name}</span>
                <span className="ml-auto text-gray-400 text-xs">↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* OSS */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">使用OSSライブラリ</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {[
              { name: "Next.js", license: "MIT", url: "https://github.com/vercel/next.js/blob/canary/LICENSE" },
              { name: "NextAuth.js", license: "ISC", url: "https://github.com/nextauthjs/next-auth/blob/main/LICENSE" },
              { name: "Prisma", license: "Apache-2.0", url: "https://github.com/prisma/prisma/blob/main/LICENSE" },
              { name: "Tailwind CSS", license: "MIT", url: "https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE" },
            ].map((lib) => (
              <div key={lib.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="font-medium">{lib.name}</span>
                <a href={lib.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs">
                  {lib.license}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
