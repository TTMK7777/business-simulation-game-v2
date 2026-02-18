# Phase 3 設計仕様書
ビジネスエンパイア 2.0 - キャラクターアイコン & アニメーションシステム

## 📋 概要

Phase 3では、ゲームにビジュアル的な生命を吹き込むため、カイロソフト風のキャラクターアニメーションシステムを実装します。

**主要機能:**
1. **ピクセルアートキャラクタースプライト**
2. **アニメーション状態管理（待機、作業中、移動）**
3. **レンダリングシステム（Phaser.js）**
4. **従業員とスプライトの連携**

---

## 🎨 デザイン方針

### ビジュアルスタイル
- **カイロソフト風ピクセルアート**: 可愛らしく、親しみやすいデザイン
- **アイソメトリック視点**: 斜め45度の見下ろし型（オプション）
- **小さなサイズ**: 32x32pxまたは48x48px（パフォーマンス重視）
- **明るい配色**: ビジネステーマに沿ったブルー/グレー系ベース

### アニメーション原則
- **シンプルさ優先**: 少ないフレーム数で表現力を最大化
- **一貫性**: 全キャラクターで同じフレーム数
- **パフォーマンス**: 30fps以下でも滑らか
- **状態の明確化**: 従業員の現在の活動が一目で分かる

---

## 🎬 アニメーション状態設計

### 1. 待機（Idle）アニメーション
**用途**: 従業員が作業していない時、休憩中

**フレーム数**: 4フレーム
- Frame 1: 基本ポーズ
- Frame 2: 上に1px移動（呼吸）
- Frame 3: 基本ポーズ
- Frame 4: 下に1px移動

**ループ速度**: 0.5秒/サイクル（2fps）

**実装詳細**:
```typescript
const idleAnimation = {
  frames: [0, 1, 0, 2], // スプライトシートのフレームインデックス
  frameRate: 2,
  repeat: -1 // 無限ループ
}
```

### 2. 作業中（Working）アニメーション
**用途**: プロジェクト作業、タスク実行中

**フレーム数**: 4フレーム
- Frame 1: 基本姿勢
- Frame 2: 作業動作（例: キーボード入力、書類整理）
- Frame 3: 基本姿勢
- Frame 4: 作業動作の反対モーション

**ループ速度**: 0.8秒/サイクル（5fps）

**バリエーション**:
- 開発職: キーボードを打つモーション
- 営業職: 電話を持つモーション
- 企画職: ペンでメモを取るモーション
- 管理職: 書類を持つモーション

### 3. 移動（Walking）アニメーション（Phase 3B/将来拡張）
**用途**: オフィス内を移動する際

**フレーム数**: 4フレーム（最小構成）
- Frame 1: 左足前
- Frame 2: 両足揃う
- Frame 3: 右足前
- Frame 4: 両足揃う

**ループ速度**: 0.4秒/サイクル（10fps）

**実装優先度**: 中（オフィスレイアウト機能実装後）

### 4. 特殊状態アニメーション（オプション）
**ストレス状態**: 頭の上に「💦」エフェクト
**高成果時**: キラキラエフェクト「✨」
**休憩中**: 「💤」エフェクト

---

## 🖼️ スプライトシート設計

### スプライト仕様
```
サイズ: 32x32px（基本）/ 48x48px（詳細版）
カラー: 16色パレット（ファイルサイズ削減）
フォーマット: PNG（透過背景）
圧縮: TinyPNG等で最適化
```

### スプライトシートレイアウト
```
[待機1][待機2][待機3][待機4][作業1][作業2][作業3][作業4]
  0      1      2      3      4      5      6      7
```

**推奨レイアウト**:
- 1行 = 8フレーム（待機4 + 作業4）
- 複数キャラクター: 縦に並べる
- 総サイズ: 256x32px（8キャラ分なら256x256px）

### カラーパレット（例）
```
肌色: #FFDBAC, #F4C2A0
髪色: #3C2415, #8B6F47, #FFD700 (金髪), #FF6B6B (赤毛)
服色: #4A90E2 (青), #50E3C2 (緑), #F5A623 (オレンジ), #D0021B (赤)
影色: #1A1A1A, #4A4A4A
```

---

## 🛠️ 技術実装

### レンダリングライブラリ選定

#### 最終選択: **Phaser.js 3.x**

**理由（Perplexity調査結果に基づく）:**

| 項目 | Canvas API | PixiJS | Phaser.js |
|------|-----------|--------|-----------|
| パフォーマンス | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| バンドルサイズ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 統合の容易さ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| アニメーション機能 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| ビジネスシミュ適性 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Phaser.jsの優位性**:
✅ TypeScript + Viteとの統合が容易
✅ スプライトシート、アニメーション、入力管理が全て組込み
✅ ゲームロジックとの連携が自然
✅ 豊富なドキュメントとコミュニティ
✅ ビジネスシミュレーションに最適な機能セット

**トレードオフ**:
⚠️ バンドルサイズが中程度（~1MB minified）
⚠️ PixiJSより若干低速（実用上は問題なし）

**代替案**:
- **PixiJS**: 最高のパフォーマンスが必要な場合（100人以上の従業員同時表示）
- **Canvas API**: 最小バンドルが必須の場合（手動実装コスト高）

### インストール
```bash
npm install phaser
npm install --save-dev @types/phaser
```

### アーキテクチャ設計

#### ファイル構造
```
src/
├── lib/
│   ├── animation/
│   │   ├── CharacterSprite.ts       # スプライト管理クラス
│   │   ├── AnimationManager.ts      # アニメーション状態管理
│   │   ├── SpriteLoader.ts          # スプライトシート読み込み
│   │   └── CharacterRenderer.ts     # Phaserシーン管理
│   └── game.ts                      # 既存ゲームロジック
├── assets/
│   └── sprites/
│       ├── employees.png            # 従業員スプライトシート
│       └── effects.png              # エフェクトスプライト
└── main.ts
```

#### コア型定義
```typescript
/**
 * アニメーション状態
 */
type AnimationState = 'idle' | 'working' | 'walking' | 'stressed'

/**
 * スプライト設定
 */
interface SpriteConfig {
  width: number
  height: number
  frameCount: number
  animations: Record<AnimationState, AnimationConfig>
}

/**
 * アニメーション設定
 */
interface AnimationConfig {
  frames: number[]      // フレームインデックス
  frameRate: number     // fps
  repeat: number        // -1 = 無限ループ
}

/**
 * キャラクタースプライト
 */
interface CharacterSprite {
  employeeId: string
  sprite: Phaser.GameObjects.Sprite
  currentState: AnimationState
  position: { x: number, y: number }
}
```

#### Phaser シーン基本構造
```typescript
// src/lib/animation/CharacterRenderer.ts
import Phaser from 'phaser'

export class CharacterScene extends Phaser.Scene {
  private characterSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()

  constructor() {
    super({ key: 'CharacterScene' })
  }

  preload() {
    // スプライトシート読み込み
    this.load.spritesheet('employees', '/assets/sprites/employees.png', {
      frameWidth: 32,
      frameHeight: 32
    })
  }

  create() {
    // アニメーション定義
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('employees', { start: 0, end: 3 }),
      frameRate: 2,
      repeat: -1
    })

    this.anims.create({
      key: 'working',
      frames: this.anims.generateFrameNumbers('employees', { start: 4, end: 7 }),
      frameRate: 5,
      repeat: -1
    })
  }

  /**
   * 従業員スプライトを追加
   */
  addCharacter(employeeId: string, x: number, y: number): void {
    const sprite = this.add.sprite(x, y, 'employees')
    sprite.play('idle')
    this.characterSprites.set(employeeId, sprite)
  }

  /**
   * アニメーション状態変更
   */
  setAnimation(employeeId: string, state: AnimationState): void {
    const sprite = this.characterSprites.get(employeeId)
    if (sprite) {
      sprite.play(state)
    }
  }

  /**
   * スプライト位置更新
   */
  updatePosition(employeeId: string, x: number, y: number): void {
    const sprite = this.characterSprites.get(employeeId)
    if (sprite) {
      this.tweens.add({
        targets: sprite,
        x: x,
        y: y,
        duration: 500,
        ease: 'Power2'
      })
    }
  }

  /**
   * スプライト削除
   */
  removeCharacter(employeeId: string): void {
    const sprite = this.characterSprites.get(employeeId)
    if (sprite) {
      sprite.destroy()
      this.characterSprites.delete(employeeId)
    }
  }
}
```

#### Phaserゲーム初期化
```typescript
// src/lib/animation/CharacterRenderer.ts
export function initCharacterRenderer(parentElement: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentElement,
    backgroundColor: '#2d3748',
    scene: [CharacterScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: true, // ピクセルアート用（アンチエイリアス無効）
      antialias: false
    }
  }

  return new Phaser.Game(config)
}
```

### 既存ゲームロジックとの統合

#### ゲーム状態とスプライトの同期
```typescript
// src/lib/game.ts に追加

import { CharacterScene } from './animation/CharacterRenderer'

let characterScene: CharacterScene | null = null

/**
 * アニメーションシステムを初期化
 */
export function initAnimationSystem() {
  const game = initCharacterRenderer(document.getElementById('game-canvas')!)
  characterScene = game.scene.getScene('CharacterScene') as CharacterScene
}

/**
 * 従業員追加時にスプライトも追加
 */
function onEmployeeAdded(employee: Employee) {
  if (characterScene) {
    const x = Math.random() * 700 + 50  // ランダム位置
    const y = Math.random() * 500 + 50
    characterScene.addCharacter(employee.id, x, y)
  }
}

/**
 * ターン処理時にアニメーション状態を更新
 */
function onTurnUpdate() {
  if (!characterScene) return

  game.employees.forEach(emp => {
    // 従業員の状態に応じてアニメーション変更
    if (emp.assigned) {
      characterScene.setAnimation(emp.id, 'working')
    } else if (emp.stress > 80) {
      characterScene.setAnimation(emp.id, 'stressed')
    } else {
      characterScene.setAnimation(emp.id, 'idle')
    }
  })
}
```

---

## 📦 アセット制作

### Phase 3A: プレースホルダースプライト（開発初期）
**目的**: システム動作確認用の仮アセット

**方法**:
1. **AI生成**: Stable Diffusion / DALL-E でプロトタイプ作成
2. **無料素材**: itch.io, OpenGameArt.org から取得
3. **簡易自作**: Aseprite / Piskel で最小限の4フレームアニメ

**推奨ツール**:
- [Piskel](https://www.piskelapp.com/): 無料オンラインエディタ
- [Aseprite](https://www.aseprite.org/): プロ向けピクセルアートツール（有料）
- [GraphicsGale](https://graphicsgale.com/): 無料Windowsアプリ

### Phase 3B: 本番アセット（システム完成後）
**オプション1: 外注**
- Fiverr / ココナラでピクセルアーティストに依頼
- 予算目安: $50-200 (8キャラクター × 2状態)

**オプション2: 自作**
- Asepriteチュートリアル学習
- カイロソフト作品を参考にスタイル模倣

**オプション3: AIアシスト**
- Midjourney / Stable Diffusion でベース生成
- 手動でピクセルアート化

---

## 🎯 実装ロードマップ

### Phase 3A: 基盤構築（4-6時間）

**ステップ1: Phaser.js統合**
- [ ] Phaser.jsインストール
- [ ] 基本的なゲームシーン作成
- [ ] HTML内にキャンバス要素配置
- [ ] 初期化処理の実装

**ステップ2: プレースホルダースプライト**
- [ ] 32x32pxの仮スプライトシート作成（8フレーム）
- [ ] スプライトシート読み込み実装
- [ ] 待機アニメーション定義
- [ ] 作業アニメーション定義

**ステップ3: ゲームロジック統合**
- [ ] 従業員追加時のスプライト生成
- [ ] 従業員状態とアニメーションの同期
- [ ] ターン更新時のアニメーション切り替え
- [ ] 従業員削除時のスプライト削除

**ステップ4: テスト**
- [ ] 5人の従業員でアニメーション動作確認
- [ ] 状態遷移（idle ↔ working）のテスト
- [ ] パフォーマンス測定（30人規模）

### Phase 3B: ビジュアル強化（3-4時間）

**ステップ1: 本番スプライト作成**
- [ ] キャラクターデザイン（4種類 × 2性別 = 8パターン）
- [ ] 各キャラクターの待機アニメーション（4フレーム）
- [ ] 各キャラクターの作業アニメーション（4フレーム）
- [ ] スプライトシート最適化（TinyPNG）

**ステップ2: 職種別バリエーション**
- [ ] 開発職: キーボード入力モーション
- [ ] 営業職: 電話モーション
- [ ] 企画職: メモ書きモーション
- [ ] 管理職: 書類チェックモーション

**ステップ3: エフェクト追加**
- [ ] ストレスエフェクト（💦）
- [ ] 高成果エフェクト（✨）
- [ ] 休憩エフェクト（💤）

### Phase 3C: UI統合（2-3時間）

**ステップ1: レイアウト調整**
- [ ] キャンバスとゲームUIの配置調整
- [ ] レスポンシブ対応（モバイル/デスクトップ）
- [ ] 従業員リストとスプライトの連動表示

**ステップ2: インタラクション**
- [ ] スプライトクリックで従業員詳細表示
- [ ] マウスホバーで従業員名表示
- [ ] スプライトの配置をドラッグ&ドロップで変更（オプション）

### Phase 3D: パフォーマンス最適化（1-2時間）

- [ ] スプライトプール実装（オブジェクト再利用）
- [ ] 画面外スプライトの描画停止
- [ ] アニメーションフレームレート調整
- [ ] バンドルサイズ確認（Phaser tree-shaking）

**合計見積もり: 10-15時間**

---

## 📊 パフォーマンス目標

### ターゲット指標
| 指標 | 目標値 | 理由 |
|------|--------|------|
| FPS | 30fps以上 | ピクセルアートは30fpsで十分滑らか |
| 従業員数 | 50人まで | 一般的なプレイで到達する規模 |
| バンドルサイズ増加 | +1.5MB以下 | Phaser.js本体 + スプライト |
| 初期ロード時間 | +0.5秒以下 | ユーザー体験を損なわない範囲 |

### 最適化戦略
✅ スプライトアトラス使用（テクスチャバッチング）
✅ オフスクリーンスプライトのカリング
✅ アニメーションフレームレート調整（状態により5fps→2fps）
✅ スプライトシートのPNG最適化（TinyPNG）

---

## 🎨 将来の拡張（Phase 4以降）

### オフィスレイアウトシステム
- 従業員がオフィス内を実際に移動
- デスク、会議室などの配置
- パスファインディング（A*アルゴリズム）

### 感情表現システム
- 表情変化（喜び、悲しみ、怒り、疲労）
- 吹き出しエフェクト（💭、💬）
- 従業員間のインタラクション表示

### カスタマイズシステム
- プレイヤーが従業員の見た目を変更
- 服装、髪型、アクセサリー
- オフィスデコレーション

### 3D化（Phase 5以降）
- Three.jsへの移行検討
- ローポリゴン3Dキャラクター
- カメラ回転・ズーム機能

---

## 🔗 参考資料

### 技術調査（Perplexity）
- Canvas API vs PixiJS vs Phaser.js 比較
- TypeScript + Vite統合のベストプラクティス
- ビジネスシミュレーションゲームの技術スタック

### デザイン調査（WebSearch）
- ピクセルアートアニメーション基礎（SLYNYRD, Sandro Maglione）
- カイロソフトスタイルスプライト（PixelJoint Forum）
- スプライトアニメーションのフレーム数設計

### ツール
- [Phaser.js公式ドキュメント](https://phaser.io/docs)
- [Piskel（無料スプライトエディタ）](https://www.piskelapp.com/)
- [TinyPNG（画像最適化）](https://tinypng.com/)
- [OpenGameArt（無料ゲームアセット）](https://opengameart.org/)

---

**作成日**: 2025-10-28
**バージョン**: 1.0
**作成者**: AI協働チーム（Claude Code + Perplexity + WebSearch）
**Phase 2完了タグ**: v2.0.0-phase2-complete
