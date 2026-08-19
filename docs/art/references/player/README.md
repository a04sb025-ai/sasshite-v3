# Player character visual references

このディレクトリは、プレイヤーキャラクター「ひかえめくん」のビジュアル検討・採用記録です。

## ファイル

- `01-character-concepts.jpg` — 初期デザイン4案の比較用コンタクトシート。**検討履歴**であり、実装基準ではありません。
- `02-character-reference-approved.jpg` — ユーザー確認済みの**採用基準アート**。キャラクターの頭身、髪型、配色、顔、表情、ポーズの Visual Source of Truth として扱います。
- `03-rive-parts-guide.jpg` — 採用基準アートをRiveで動かすための**パーツ分解・可動点の参考図**です。

## Source of Truth

正式な文字仕様は以下を優先します。

1. `docs/character-spec-player.md`
2. `docs/rive/player-character-parts-v1.md`
3. 本ディレクトリの `02-character-reference-approved.jpg`
4. 本ディレクトリの `03-rive-parts-guide.jpg`

仕様と画像で解釈が衝突した場合は、勝手に変更せず確認してください。

## 注意

ここに置くJPEGは、GitHub上で設計意図を参照するための軽量リファレンスコピーです。Riveへ投入する本番用パーツ素材そのものではありません。本番アセットは別途、透明背景・規定レイヤー名・十分な解像度で作成します。

外部ゲームやストア画面の参考スクリーンショットは、権利関係と公開リポジトリであることを考慮して保存しません。
