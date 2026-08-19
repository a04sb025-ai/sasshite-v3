# Rive用パーツ分解仕様書 v1.0

**対象:** プレイヤーキャラクター「ひかえめくん」  
**上位仕様:** `docs/character-spec-player.md`  
**目的:** 画像生成 / パーツ分解 / Riveリグ / Codex組み込みの共通仕様

---

## 1. 目的

この文書は、プレイヤーキャラクターをRiveで自然に動かすための、レイヤー分割・命名・重なり・ピボット・ボーン・アニメーション・ゲーム側パラメータを定義します。

目標は以下です。

- 1体目のリグを今後のテンプレートとして再利用できる
- 新キャラクター追加時の人手を減らす
- 画像差し替えやアセット置換で流用しやすくする
- PixiJS / JavaScriptから連続値で反応を制御できる
- 関節やパーツ境界が人形っぽく見えない

---

## 2. 基本アート姿勢

最初の基準アートは **正面〜わずかな3/4** とします。

### 推奨

- 身体: ほぼ正面
- 顔: 5〜10度程度の軽い3/4まで
- 両腕: 身体から少し離して自然に下ろす
- 両脚: 少し間隔を空ける
- 手足を重ねすぎない

Tポーズのような不自然な姿勢ではなく、ゲーム画面へそのまま置いても違和感が少ないニュートラル姿勢を使います。

---

## 3. アートキャンバス基準

### 推奨マスターサイズ

- Canvas: `2048 x 2048 px`
- 背景: 透明
- キャラクター全高: 約 `1500〜1650 px`
- 足元から上下左右に十分な余白を残す

最終Webアセットでは必要に応じて縮小・WebP化します。マスターは編集耐性を優先して高解像度を保持します。

---

## 4. 必須レイヤー一覧

以下の名前を基準とし、勝手に別名へ変更しません。

### Head

- `hair_back`
- `ear_L`
- `ear_R`
- `face_base`
- `brow_L`
- `brow_R`
- `eye_L`
- `eye_R`
- `mouth`
- `hair_front`

### Torso

- `neck`
- `torso`
- `pelvis`

### Left arm

- `upper_arm_L`
- `forearm_L`
- `hand_L`

### Right arm

- `upper_arm_R`
- `forearm_R`
- `hand_R`

### Left leg

- `upper_leg_L`
- `lower_leg_L`
- `foot_L`

### Right leg

- `upper_leg_R`
- `lower_leg_R`
- `foot_R`

### Optional effects

- `cheek_L`
- `cheek_R`
- `sweat_01`
- `sweat_02`
- `notice_mark`
- `awkward_mark`
- `relief_mark`
- `ground_shadow`

---

## 5. レイヤー重なり順

奥から手前の基本順です。

1. `ground_shadow`
2. `hair_back`
3. back-side arm / leg parts if pose requires
4. `pelvis`
5. `torso`
6. `neck`
7. `ear_L`, `ear_R`
8. `face_base`
9. `eye_L`, `eye_R`
10. `brow_L`, `brow_R`
11. `mouth`
12. `cheek_L`, `cheek_R`
13. `hair_front`
14. front-side arm / hand parts
15. `sweat_*`, `notice_mark`, `awkward_mark`, `relief_mark`

左右どちらの腕が手前になるかはポーズで変えられますが、通常立ちでは右腕をわずかに手前側として扱うことを推奨します。

---

## 6. 隠れている部分を必ず描く

パーツ分解時は、静止画で見えない部分も描き足します。

### 必須

- 腕の裏に隠れている胴体
- 前髪の裏に隠れている額
- 頭の後ろに隠れている耳周辺
- 袖の内側に隠れている腕
- パンツに隠れている脚の付け根
- 靴に隠れている足首

### 目的

パーツを回転・変形した時に、透明な穴や切れ目が見えないようにするためです。

---

## 7. 関節周辺のオーバーラップ

パーツ同士はぴったり接触させず、必ず重ねます。

### 推奨重なり量

マスター2048px基準で、関節の短辺に対して **15〜25%程度** を目安に重ねます。

特に以下は十分な重なりが必要です。

- shoulder: `torso` ↔ `upper_arm_*`
- elbow: `upper_arm_*` ↔ `forearm_*`
- wrist: `forearm_*` ↔ `hand_*`
- hip: `pelvis` ↔ `upper_leg_*`
- knee: `upper_leg_*` ↔ `lower_leg_*`
- ankle: `lower_leg_*` ↔ `foot_*`
- neck: `torso` ↔ `neck` ↔ `face_base`

---

## 8. ピボット位置

各パーツの回転中心は、画像中央ではなく実際の関節位置へ設定します。

### Head

- `face_base`: 首の付け根中央
- `hair_front`: 頭頂〜額上部の中央寄り
- `hair_back`: 首の後ろ寄り
- eyes / brows / mouth: 基本は各パーツ中心

### Arms

- `upper_arm_*`: 肩関節中央
- `forearm_*`: 肘関節中央
- `hand_*`: 手首中央

### Legs

- `upper_leg_*`: 股関節中央
- `lower_leg_*`: 膝中央
- `foot_*`: 足首中央

---

## 9. 推奨ボーン構造

```text
root
└─ pelvis
   ├─ torso
   │  ├─ neck
   │  │  └─ head
   │  │     ├─ hair_back
   │  │     ├─ face
   │  │     └─ hair_front
   │  ├─ upper_arm_L
   │  │  └─ forearm_L
   │  │     └─ hand_L
   │  └─ upper_arm_R
   │     └─ forearm_R
   │        └─ hand_R
   ├─ upper_leg_L
   │  └─ lower_leg_L
   │     └─ foot_L
   └─ upper_leg_R
      └─ lower_leg_R
         └─ foot_R
```

顔パーツはボーンで無理に動かさず、必要に応じてTransform / Mesh / State Machineパラメータで制御します。

---

## 10. メッシュ変形を使う優先順位

メッシュは必要な部分だけに使います。

### 優先度 High

- `hair_front`
- `hair_back`
- `torso` の軽い呼吸変形
- `face_base` のごく弱い向き変化を実現する場合

### 優先度 Medium

- 袖
- パンツ裾

### 原則ボーン中心

- 上腕
- 前腕
- 手
- 太もも
- すね
- 足

過剰なメッシュ分割は管理コストと描画負荷を増やすため避けます。

---

## 11. 顔パーツ制御

### Eye

最低限以下を表現できること。

- open = 0.0〜1.0
- gazeX = -1.0〜1.0
- gazeY = -1.0〜1.0

白目は使わないため、視線移動は黒目自体を大きく動かすのではなく、目パーツ全体のごく小さな位置変化・潰し・頭部回転との組み合わせで表現します。

### Brow

- browRaise = -1.0〜1.0
- browTension = 0.0〜1.0

### Mouth

最低限3状態。

- neutral line
- small smile
- small `o`

必要なら口形状の補間または3スロット切替を使います。

---

## 12. State Machine / Data Binding用パラメータ

PixiJS / JavaScript側から扱う標準パラメータ名です。

### Continuous

- `breath` : 0.0〜1.0
- `gazeX` : -1.0〜1.0
- `gazeY` : -1.0〜1.0
- `headTilt` : -1.0〜1.0
- `bodyLean` : -1.0〜1.0
- `tension` : 0.0〜1.0
- `awkwardness` : 0.0〜1.0
- `relief` : 0.0〜1.0
- `armReachL` : 0.0〜1.0
- `armReachR` : 0.0〜1.0

### Trigger / Boolean

- `blink`
- `notice`
- `flinch`
- `stepBack`

可能な限り、感情は `neutral / concern` の離散状態ではなく連続値で表現します。

---

## 13. 必須アニメーション名

Rive内のアニメーション名は以下を基準にします。

### Loop

- `idle_breathe`
- `idle_shift_weight`
- `blink_soft`
- `gaze_wander`

### Reactions

- `notice_small`
- `hesitate_small`
- `awkward_small`
- `flinch_small`
- `reach_L`
- `reach_R`
- `step_back_small`
- `relief_small`

### PoCで最優先

1. `idle_breathe`
2. `blink_soft`
3. `gaze_wander`
4. `notice_small`
5. `awkward_small`
6. `reach_R`
7. `relief_small`

---

## 14. 動きの強度制限

「察して。」では派手なアニメーションを避けます。

### 目安

- headTilt: 通常 ±5°、最大でも ±10°程度
- bodyLean: 通常 ±3°、反応時でも ±8°程度
- breathing scale: 1〜2%程度
- idle translation: 数px相当
- weight shift: ごく小さい

数値は最終リグで調整可能ですが、キャラクターの控えめさを守ります。

---

## 15. まばたき仕様

- 間隔: 完全固定にしない
- 平均: 3〜6秒程度
- 連続2回まばたきが稀に発生してよい
- 開閉は速く、閉じた状態は短い
- 困り・緊張状態では頻度をわずかに変えてよい

PixiJS側で完全ランダムにせず、Rive側または決定論的擬似ランダムで再現可能にすることを推奨します。

---

## 16. 呼吸仕様

- 胴体の上下・拡縮は非常に弱くする
- 肩が大きく上下しない
- 頭もごく少し追従する
- 周期は約3〜5秒程度を基準
- 機械的な正弦波に見えないよう微調整可能

---

## 17. 視線仕様

- 常時キョロキョロさせない
- 基本はニュートラル
- 時々、近くの対象へわずかに視線を向ける
- ゲーム中に正解対象へ自動ロックしない
- 主人公の視線で答えを教えない

---

## 18. アセット出力

### Master

編集可能な元データを保持します。

### Runtime候補

- `.riv` : Rive runtime asset
- raster parts: PNG または WebP
- 原則としてゲーム側で不要な巨大マスター画像は配布物へ含めない

### ファイル配置候補

```text
assets/
└─ characters/
   └─ player/
      ├─ rive/
      │  └─ player-base.riv
      ├─ source/
      └─ preview/
```

実際のディレクトリはPoC実装時にCodexが既存構成と整合させて決めます。

---

## 19. 品質チェック

Rive組み込み前後で以下を確認します。

- 腕を上げても胴体に穴が出ない
- 首を傾けても首元が切れない
- 髪を動かしても額や頭頂に欠損が出ない
- 膝・肘が外れた人形に見えない
- まばたきで目の輪郭が不自然に潰れない
- 3/4方向の印象が基準イラストから崩れない
- 小さいAndroid画面でも目線と表情が読める
- 60fps目標で過剰な負荷を生まない

---

## 20. 自動化優先方針

人の手作業を減らすため、1体目で次をテンプレート化します。

- レイヤー名
- 骨名
- ピボット規則
- State Machineパラメータ名
- アニメーション名
- ファイル配置
- JavaScript側インターフェース

新キャラクターでは、可能な限り **アートをテンプレートへ合わせる** 方針を優先します。

毎回リグをキャラクターへ合わせてゼロから作る運用にはしません。

---

## 21. PoC完了条件

このパーツ仕様で作った1体について、以下を満たせば次工程へ進みます。

1. 静止中も生命感がある
2. まばたき・呼吸・視線が自然
3. `tension` 等の連続値で中間状態が自然に見える
4. パーツ境界が目立たない
5. Androidで滑らか
6. PixiJSから値を制御できる
7. 次のキャラクターへテンプレート再利用できる見込みがある
