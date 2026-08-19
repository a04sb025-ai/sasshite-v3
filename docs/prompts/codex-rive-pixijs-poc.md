# Codex実装プロンプト — Rive + PixiJS キャラクターPoC v1.0

以下をそのままCodexへ渡すことを想定した実装指示です。

---

## Prompt

GitHubリポジトリ `a04sb025-ai/sasshite-v3` で、プレイヤーキャラクター「ひかえめくん」の **Rive + PixiJS技術PoC** を実装してください。

### 0. 最優先ルール

実装前に必ず以下を最後まで読んでください。

1. `AGENTS.md`
2. `README.md`
3. `docs/concept.md`
4. `docs/character-spec-player.md`
5. `docs/rive/player-character-parts-v1.md`
6. `docs/art/visual-guidelines.md`
7. `docs/poc/rive-pixijs-poc.md`

これらは参考資料ではなく仕様です。

矛盾がある場合は勝手に解釈して実装せず、矛盾点を明示してください。キャラクターやアート方向を実装都合で変更しないでください。

---

## 1. 今回の目的

本編ゲームを作ることが目的ではありません。

**ChatGPT + Rive + PixiJS + Codex の構成で、少ない人手でも高品質で滑らかな2Dキャラクター表現を作り、ゲーム側から連続値で制御できるかを検証するPoC** を作ります。

PoCで証明したいこと:

- キャラクターが静止中でも生きて見える
- まばたき・呼吸・視線が自然
- 感情が0/1の差分画像ではなく連続的に変化する
- PixiJS / JavaScriptからRive状態をリアルタイム制御できる
- Androidスマホで滑らかに動く
- 後から同じ仕組みを他キャラクターへ再利用できる

---

## 2. 今回作る画面

PoCは **1画面・1キャラクターのみ** としてください。

画面要素:

- 中央: Riveのプレイヤーキャラクター1体
- 背景: 単純な無彩色または薄色。完成ゲーム背景は不要
- 開発用コントロール領域
- FPS / runtime statusなど最小限のデバッグ情報

本番ゲームUI、スコア、ステージ、ランキング、正解表示、成功バナーは作らないでください。

---

## 3. Riveアセットの扱い

最終人物アートをCodexがSVG/CSSで描き直すことは禁止します。

期待するRiveアセットパス候補:

`public/assets/characters/player/player-base.riv`

既存構成上より良い場所があれば、理由を説明したうえで変更して構いません。

### `.riv` がまだ存在しない場合

存在しないRiveファイルを捏造したり、SVG人物へ代替したりしないでください。

その場合は:

1. Rive asset adapter / loader
2. PixiJS画面
3. 開発用コントロール
4. 型・状態管理
5. エラー表示
6. テスト可能なinterface

まで実装し、実アセットが追加されたら差し替えるだけでPoCを完成できる状態にしてください。

キャラクター表示部分は、**明確に「Rive asset missing」と分かる開発用プレースホルダー**で構いません。人物の代替イラストは描かないでください。

---

## 4. 技術構成

### 必須

- TypeScript
- PixiJS 8系
- Rive Web Runtimeの現行公式パッケージ
- Vite等の小規模なWeb開発環境
- Android Chromeを主要ターゲットとする

依存バージョンは実装時点の公式情報と互換性を確認し、安定版を選択してください。

不要な大型フレームワークは導入しないでください。

---

## 5. Rive制御interface

ゲーム側からRiveへ渡す値を、直接散在させず1つのadapterへ集約してください。

例:

```ts
export interface PlayerCharacterState {
  tension: number;       // 0..1
  awkwardness: number;   // 0..1
  relief: number;        // 0..1
  gazeX: number;         // -1..1
  gazeY: number;         // -1..1
  headTilt: number;      // -1..1
  bodyLean: number;      // -1..1
  armReachL: number;     // 0..1
  armReachR: number;     // 0..1
}
```

Trigger系:

- `blink`
- `notice`
- `flinch`
- `stepBack`

Rive側のState Machine / Data Bindingとの具体的な接続は、Riveランタイムの現行公式APIに従ってください。

---

## 6. PoC用コントロール

技術検証専用UIとして以下を用意してください。

### Continuous controls

- tension 0..1
- awkwardness 0..1
- relief 0..1
- gazeX -1..1
- gazeY -1..1
- headTilt -1..1
- bodyLean -1..1
- armReachR 0..1

### Trigger buttons

- blink
- notice
- flinch
- reset

このUIは本編ゲームには使用しない前提です。

スマホで操作できる十分なタッチサイズを確保してください。

---

## 7. 自動デモモード

手動スライダーとは別に、30〜45秒程度の自動デモを用意してください。

例:

1. neutral / idle
2. gaze shift
3. notice
4. tension 0 → 0.35
5. tension 0.35 → 0.7 + awkwardness上昇
6. armReachR 0 → 0.3
7. tension下降
8. relief上昇
9. neutralへ戻る

途中値が自然に補間されることを確認する目的です。

アニメーション状態を離散的に瞬間切替するだけのデモにはしないでください。

---

## 8. 生命感

Riveアセットが対応している場合は、以下を同時に成立させてください。

- 小さな呼吸
- ランダム感のあるまばたき
- ごく小さな重心移動
- 時々の視線移動

主人公が常時キョロキョロしたり、大きく揺れ続けたりしないようにしてください。

---

## 9. 表現上の禁止事項

- SVG/CSSで最終人物を描く
- `SUCCESS` / 正解 / 不正解表示
- ハートやゲージで感情を本番UIのように見せる
- NPCやゲームステージを追加する
- ひかえめくんを派手なアニメキャラへ変更する
- 白目や大きなハイライトを勝手に追加する
- 大げさなバウンス、伸縮、顔芸
- 正解方向を主人公の視線で自動的に教える

---

## 10. Android / パフォーマンス

スマホ最優先です。

### 確認事項

- portrait画面で破綻しない
- 小さい画面でもコントロール操作可能
- DPRが高い端末でも無駄に巨大なrendererを生成しない
- ページスクロールとキャラクター操作が競合しない
- WebGL/WebGPU fallback behaviorを確認
- runtime errorを画面またはconsoleで明確に診断できる

### 目標

- 60fpsを目標
- 安定しない場合は30fps以上を最低ラインとして原因をレポート

FPSは開発用表示で確認できるようにしてください。

---

## 11. アーキテクチャ

最低限、責務を以下のように分けてください。

```text
src/
├─ app/
├─ character/
│  ├─ PlayerCharacterController.ts
│  ├─ PlayerCharacterState.ts
│  └─ RivePlayerAdapter.ts
├─ poc/
│  ├─ PocControls.ts
│  └─ DemoSequence.ts
└─ main.ts
```

これは例です。既存構成に合わせたより良い分割は可ですが、Rive固有コードとゲーム状態を密結合させないでください。

将来的にRive以外のキャラクターrendererへ差し替えられる程度のinterface分離を目指してください。ただし過剰設計は不要です。

---

## 12. テスト

少なくとも以下を自動テストしてください。

- state値のclamp
- `-1..1` / `0..1` の範囲保証
- resetでneutral stateへ戻る
- DemoSequenceが規定順に状態を遷移する
- Rive assetがない場合に明確なmissing stateになる
- runtime adapterが存在しない入力名で静かに壊れない

ブラウザE2Eが容易なら、最低限ページ起動と主要コントロールのsmoke testも追加してください。

---

## 13. npm scripts

少なくとも以下を用意してください。

```text
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

可能なら `npm run check` で主要チェックをまとめてください。

---

## 14. README / docs

実装後、READMEへPoCの起動方法を追記してください。

ただし仕様をREADMEへコピーして重複させず、詳細は既存docsへリンクしてください。

以下を記録してください。

- 必要Node.jsバージョン
- install
- dev起動
- test/build
- Riveアセット配置場所
- アセットが未配置の場合の挙動
- Android実機確認方法

---

## 15. 実装の進め方

1. リポジトリと全仕様を確認
2. 既存状態を報告
3. 最小構成を設計
4. 実装
5. typecheck
6. lint
7. test
8. build
9. 可能ならブラウザでPoCを確認
10. 変更ファイル一覧と結果を報告

チェック失敗を隠さないでください。

---

## 16. 完了報告に必ず含めるもの

- 実装概要
- 追加/変更ファイル
- 使用したPixiJS / Rive Runtimeのバージョン
- `.riv` assetが実際に接続できたか
- typecheck結果
- lint結果
- test結果
- build結果
- Android確認の実施可否
- 60fps目標に対する現状
- 残課題
- 次に人間が行う必要がある作業

特に、**人間の手作業が発生する部分を隠さず明示してください。**

---

## 17. PoC合格判定

コードが動くだけでは合格ではありません。

最終的には人間が実機で以下を判定します。

1. 以前のSVG/CSS人物より明らかに魅力的
2. 静止中でも生きて見える
3. 中間表情が自然
4. 関節やパーツ境界が目立たない
5. Androidで滑らか
6. 操作への反応遅延が気にならない
7. この仕組みを他キャラへ再利用できそう
8. キャラ追加ごとに大量の手作業が発生しない

この判定前に本編や複数ステージへ拡張しないでください。
