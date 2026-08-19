# 察して。v3

「察して。」の第3世代開発リポジトリです。

このリポジトリでは、実装を急がず、ゲームデザイン・キャラクター・アート・PoCの仕様を先に固定してから開発します。

## 現在のフェーズ

**仕様策定 / Rive + PixiJS PoC準備**

まだ本編ゲームの実装は開始しません。

## 制作方針

- スマートフォンを最優先する
- プレイヤーが「観察 → 推測 → 介入 → 相手の反応 → 再推測」を行うことをゲームの核にする
- ○×、正解表示、説明過多のUIに頼らない
- 人物の仕草・視線・距離・間から状況を読めるようにする
- ビジュアルは「描き込み量」より「一瞬で状況と関係性が読めること」を優先する
- メインキャラクターとアートルールを固定し、再利用可能な制作パイプラインを作る
- ChatGPTが設計・アートディレクション、Codexが実装・テスト・自動化を主に担当する
- 人の手作業を可能な限り減らす

## 技術PoC候補

- Rive: キャラクターの2Dリグ・アニメーション
- PixiJS: ゲーム描画・入力・状態制御・演出
- ChatGPT: 仕様、画像生成、アート設計、レビュー
- Codex: 実装、テスト、ビルド、デプロイ、自動化

## 仕様書

### Core

- `docs/concept.md` — 作品コンセプト
- `docs/character-spec-player.md` — プレイヤーキャラクター正式詳細仕様 v1.0
- `docs/art/visual-guidelines.md` — ビジュアル方針

### Rive / PoC

- `docs/rive/player-character-parts-v1.md` — Rive用パーツ分解・リグ仕様 v1.0
- `docs/poc/rive-pixijs-poc.md` — Rive + PixiJS PoC仕様
- `docs/prompts/codex-rive-pixijs-poc.md` — Codexへ渡すPoC実装プロンプト

### Compatibility

- `docs/characters/hikamekun.md` — 旧キャラクター仕様から正式仕様への案内

## 開発ルール

実装・変更を行うAIは、最初に `AGENTS.md` と関連する `docs/` を最後まで確認してください。

仕様と実装が衝突する場合は、独自判断で仕様を変えず、仕様側を確認・更新してから実装します。
