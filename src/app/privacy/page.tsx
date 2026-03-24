export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <a href="/" className="text-sm text-indigo-500 hover:underline">← よむちゃに戻る</a>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">プライバシーポリシー</h1>
          <p className="text-xs text-gray-400 mt-1">最終更新: 2026年3月24日</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">収集する情報</h2>
            <p>本サービスでDiscordアカウントでログインした場合、以下の情報を取得・保存します：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>DiscordユーザーID・ユーザー名・アバター画像URL</li>
              <li>本サービス内の設定（音声・フィルター設定など）</li>
            </ul>
            <p className="text-gray-500">ログインしない場合、いかなる情報も保存しません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>ユーザー設定の保存・復元</li>
              <li>ログイン状態の維持</li>
            </ul>
            <p>収集した情報を第三者に提供・販売することはありません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">Cookieについて</h2>
            <p>ログインセッションの維持のためCookieを使用します。ブラウザの設定によりCookieを無効にできますが、ログイン機能が利用できなくなります。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">データの削除</h2>
            <p>アカウントデータの削除をご希望の場合は、下記連絡先までお問い合わせください。</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-gray-800">外部サービス</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Discord OAuth2（認証）</li>
              <li>YouTube Data API / Twitch IRC / TwitCasting API（コメント取得）</li>
              <li>Cloudflare（CDN・通信）</li>
            </ul>
            <p>各サービスのプライバシーポリシーに従って情報が処理される場合があります。</p>
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
