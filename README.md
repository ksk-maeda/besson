# BESSON 公式サイト

ワインセラーD2Cブランド「BESSON」の公式サイト。Astro + Vercelで構築。

## 開発

```sh
npm install
npm run dev      # ローカル開発サーバー
npm run build    # 本番ビルド（dist/に出力）
npm run preview  # ビルド後のプレビュー
```

## ブランド・コンテンツの正本

サイトのコピー・世界観・製品情報は `/Users/ksk-maeda/自分専用AI/プロジェクト/BESSON/` のVaultが正本。
特に以下は必読：

- `概要.md` — ステータス・タスク・決定事項
- `サイト構成案.md` — サイトマップ・ページ構成
- `ブランドコンセプト.md` — WHY/HOW、5空間の世界観、タグライン
- `コピー探求プロンプト.md` — 確定コピー（現行版）
- `00_引き継ぎメモ.md` — 凍結事項・過去の消耗ポイント

コピーやカテゴリー名を変更する前に、必ずVault側の凍結状況を確認すること。

## 構成

- `src/content/products/*.json` — 全11モデルのスペック・コピー・FAQ（Content Collections）
- `src/lib/categories.ts` — 5空間の確定コピー・世界観
- `src/lib/cart.ts` — localStorageカート
- `src/components/PhotoSlot.astro` — 写真プレースホルダー（実写真差し替え可能な設計）
- `src/pages/checkout.astro` + `src/pages/api/*.ts` — Stripe Payment Element埋め込み型の自社決済（`/checkout`と`/api/*`のみオンデマンドレンダリング、他は静的。`@astrojs/vercel`アダプタ使用）
- `_legacy/` — 旧サイト（素のHTML、モバイル専用プロトタイプ）。参照用に保持

## 決済機能のセットアップ（本番稼働に必須）

`.env.example` を参照。Stripeアカウント作成・APIキー取得・Vercel環境変数への設定はけいさんの作業（AI代行不可）。未設定の間は`/checkout`に「準備中」の案内が出るだけで、他のページ・購入までの導線は問題なく動く。

## 既知の未完了事項（2026-08-11時点）

- 実写真が0枚。全ページ `PhotoSlot` プレースホルダーで組んである
- ドメイン（besson.jp）未取得
- 看板3モデル（C7・C80・C28st）のコピーはAIドラフト。要レビュー（`headlineIsDraft: true`のモデル）
- 残り8モデルのコンセプトコピーは未着手（スペックのみ）
- Stripe/Resendの環境変数が未設定（`.env.example`参照）。設定するまで決済は動作しない
- 出荷・フルフィルメント方式が未決定（Amazon MCF推奨——詳細は概要.mdの決定事項を参照）
- 品番（SKU）・同梱物データが10/11モデルで欠損（メーカー資料から要取得）
- オプショナルパーツ（交換用棚等）のSKU・価格が未定義。カート機構は複数商品対応済みなので、パーツのcontent collectionエントリを追加すればすぐ販売できる状態
