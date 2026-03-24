export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <a href="/" className="text-sm text-indigo-500 hover:underline">← よむちゃに戻る</a>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">利用規約</h1>
          <p className="text-xs text-gray-400 mt-1">最終更新: 2026年3月24日</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">第1条（適用）</h2>
            <p>本規約は、1kaguya（以下「運営者」）が提供するWebサービス「よむちゃ」（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">第2条（利用条件）</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>本サービスは個人・非商用目的での利用を想定しています</li>
              <li>各配信プラットフォーム（YouTube・Twitch・ツイキャス）の利用規約を遵守してください</li>
              <li>本サービスを通じた違法行為・迷惑行為を禁止します</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">第3条（免責事項）</h2>
            <p>本サービスは現状有姿で提供されます。運営者は本サービスの稼働・機能について保証しません。本サービスの利用によって生じた損害について、運営者は一切の責任を負いません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">第4条（サービスの変更・終了）</h2>
            <p>運営者は予告なく本サービスの内容変更・停止・終了を行う場合があります。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">第5条（規約の変更）</h2>
            <p>本規約は必要に応じて変更される場合があります。変更後も本サービスを利用した場合、変更後の規約に同意したものとみなします。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">お問い合わせ</h2>
            <p>Discord: 1kaguya / X (Twitter): @1kaguya</p>
          </section>
        </div>
      </div>
    </div>
  );
}
