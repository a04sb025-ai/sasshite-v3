# ひかえめくん 座りポーズ用 Rive パーツ分解仕様書 v1.0

## 1. 目的

『察して。v3』の正式プレイヤーキャラクター「ひかえめくん」を、見た目を崩さず Rive で自然に座らせるための仕様。

座りポーズは立ち状態の脚を無理に大変形させない。**頭部・顔は立ち状態と共有し、身体だけ座り専用セットへ切り替える**ことを基本とする。

優先順位は以下。

1. 同じ「ひかえめくん」に見える
2. 座り姿が自然
3. スマホで表情が読める
4. 軽い呼吸・視線・感情変化を付けられる
5. standing / sitting の切り替えが目立たない

---

## 2. 正式な座り姿勢

- 正面〜ごく弱い 3/4
- 膝をほぼ正面へそろえる
- 両足を床につける
- 背筋は伸ばしすぎず、少し控えめ
- 肩の力を抜く
- 両手は膝付近へ自然に置く
- ニュートラル表情を初期状態とする

立ち状態と同じ髪型、顔、頭身、配色、線幅を維持する。

---

## 3. 構造

```text
player
├─ shared_head
│  ├─ hair
│  ├─ face
│  ├─ eyes
│  ├─ brows
│  └─ mouth
├─ standing_body
│  ├─ torso_stand
│  ├─ arm_R_stand
│  ├─ arm_L_stand
│  ├─ leg_R_stand
│  └─ leg_L_stand
└─ sitting_body
   ├─ torso_sit
   ├─ arm_R_sit
   ├─ arm_L_sit
   ├─ leg_R_sit
   └─ leg_L_sit
```

standing_body と sitting_body は同時表示しない。

---

## 4. PoC 推奨10レイヤー

```text
01 hair
02 face
03 eyes
04 brows
05 mouth
06 torso_sit
07 arm_R_sit
08 arm_L_sit
09 leg_R_sit
10 leg_L_sit
```

R/L はキャラクター本人から見た左右。

必要に応じて `reaction_symbol`、`sweat`、`shadow_sit` を別レイヤー追加する。

---

## 5. 共有パーツ

### `hair`

- 正式基準アートの髪型を維持
- 小さな跳ね毛を含む
- 首かしげに合わせて軽く Mesh 変形可能

### `face`

- 頭部輪郭、耳、首の最小部分
- 目・眉・口は焼き込まない
- 立ち / 座り共通

### `eyes`

- 白目なし、黒い縦楕円
- まばたき・小さな視線移動に使用

### `brows`

- 気づき、困り、安心の感情表現に使用

### `mouth`

- ニュートラルを基本
- 将来 `open` / `awkward` / `smile` へ拡張可能

---

## 6. 座り専用パーツ

### `torso_sit`

- 立ち状態より縦方向をわずかに圧縮
- 腰が脚の後ろへ自然に入る形
- 裾は座位に合わせて少し広がってよい
- 色・首元・線幅は立ち状態と一致
- 呼吸用の軽い Mesh 変形のみ行う

### `arm_R_sit` / `arm_L_sit`

- 肩から手までを座り専用形状として扱う
- 肘を軽く曲げ、手を膝付近へ置く
- 立ち用腕を大きく曲げて流用しない
- 手が重なる場合は前後関係を固定する
- 動きは、手を少し寄せる・引く・持ち上げる程度

### `leg_R_sit` / `leg_L_sit`

- PoC では太もも〜足先まで1脚1パーツでよい
- 膝が自然に前へ出る
- すねはほぼ垂直
- 靴は床へ接地
- 左右脚は別パーツ
- 1枚の大きなパンツ形状にしない
- 立ち用脚を90°近く曲げて流用しない

座り脚は細分化より **1枚絵 + Mesh** を優先し、正式アートのシルエット維持を重視する。

---

## 7. Bone / Mesh 方針

### 頭

```text
root
└─ body
   └─ neck
      └─ head
```

`hair / face / eyes / brows / mouth` を head に追従させる。

### 胴体

```text
body
└─ chest
```

`torso_sit` を chest に Bind。呼吸はごく弱くする。

### 腕

各腕に簡易 Bone を1〜2本。

```text
shoulder
└─ elbow_hint
```

大きな関節運動より Mesh の小変形を優先。

### 脚

各脚1〜2 Bone 程度。目的は歩行ではなく、膝の微動・足の小さな揺れ・緊張時に少し脚を寄せる程度。

---

## 8. Z-order

基準は奥から手前へ以下。

```text
leg_back
arm_back
torso / face base
leg_front
arm_front
hair
face parts
reaction symbol
```

手と膝の重なりは正式座りアートを優先する。

---

## 9. 必須アニメーション

### `sit_idle`
- ループ 2.5〜4秒
- 弱い呼吸
- ごく弱い頭部上下
- ランダムまばたき

### `sit_blink`
- 0.15〜0.25秒
- 立ち状態と共有可能

### `sit_look`
- 小さな視線移動
- 頭を2〜5°程度傾ける

### `sit_awkward`
- 肩を少し縮める
- 手を少し寄せる
- 困り眉
- 必要なら汗1つ

### `sit_relaxed`
- 肩がわずかに下がる
- 表情が少しゆるむ

---

## 10. Standing → Sitting

PoC では全身を大変形させない。

```text
standing
↓
少し腰を落とす
↓
0.2〜0.4秒の短いトランジション
↓
standing_body OFF
sitting_body ON
↓
sit_idle
```

まばたき、身体の上下移動、必要なら軽いカメラ演出を合わせ、切り替えを目立たせない。

### 禁止

- 立ち脚を極端に曲げる
- Mesh を大きく伸縮する
- 顔・髪を座り専用に描き直して別人化する
- standing / sitting が1フレームでも二重表示される

---

## 11. ゲーム側インターフェース

PixiJS 側から Bone を直接操作しない。

想定状態:

```text
pose = standing | sitting
emotion = neutral | noticed | awkward | relieved
attention = left | center | right
```

想定入力:

```text
isSitting
noticed
awkward
relieved
lookLeft
lookRight
```

Rive 側で表現へ変換する。

---

## 12. 合格条件

- [ ] 基準アートと同じキャラクターに見える
- [ ] 髪型・顔・頭身・配色が変わっていない
- [ ] 膝をそろえた座り姿が自然
- [ ] 手と膝の重なりに違和感がない
- [ ] `sit_idle` で輪郭が破綻しない
- [ ] 首かしげ ±5° 程度で髪と顔がずれない
- [ ] まばたき・視線移動が自然
- [ ] `sit_awkward` がひかえめくんらしい
- [ ] standing → sitting の切り替えが目立たない
- [ ] スマホ実機で表情が読み取れる

---

## 13. PoC の制作範囲

最初は以下だけ完成させる。

- 正面ニュートラル座り
- `sit_idle`
- `sit_blink`
- `sit_look`
- `sit_awkward`
- `sit_relaxed`
- standing / sitting 切り替え

横向き座り、脚組み、大規模な立ち上がりアニメーションは後回し。

---

## 14. 関連仕様

- `docs/character-spec-player.md`
- `docs/rive/player-character-parts-v1.md`
- `docs/rive/player-animation-list-v1.md`

座りポーズに関して仕様が競合した場合、本書を優先する。
