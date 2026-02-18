# Phase 3C: プロフェッショナルアニメーションシステム再設計
**ビジネスエンパイア 2.0 - RimWorld/カイロソフト品質への進化**

**作成日**: 2025-10-28
**目標**: 現在の低品質プロシージャル生成を、名作2Dシミュレーションゲーム級の高品質スプライトアニメーションに刷新

---

## 🎯 プロジェクト目標

### 現状の問題点
- ❌ Canvas API（矩形・円・線）のみの抽象的な表現
- ❌ 単純な位置オフセット（Y±2px）で「動いている感」がない
- ❌ 48x48pxの解像度でディテール不足
- ❌ 職種の視覚的差別化が弱い（色とアイコンのみ）
- ❌ アニメーションがない方がマシなレベル（ユーザー指摘）

### 達成目標
- ✅ **RimWorld級の視覚的明瞭性**: 遠目でも職種が一目で分かる
- ✅ **カイロソフト級の親しみやすさ**: キャラクターに愛着が湧くデザイン
- ✅ **滑らかなアニメーション**: フレーム補間とステートマシン
- ✅ **豊富なバリエーション**: 性別・年齢・表情・服装の多様性

---

## 📊 RimWorld技術分析から学んだこと

### 1. **レイヤーレンダリングシステム**
**RimWorldの実装**:
```
レイヤー順（後ろから前）：
1. ベースボディ（裸体・肌色）
2. 下着・下衣
3. 上衣（シャツ・ジャケット）
4. アクセサリー（ヘッドホン・タブレット等）
5. 装備・持ち物
6. ステータスエフェクト（汗・キラキラ等）
```

**本プロジェクトへの適用**:
- 既存の5レイヤーシステムを維持
- プロシージャル生成 → **AI生成スプライトシート**に置き換え
- 各レイヤーを独立した画像ファイルとして管理

### 2. **アニメーションステートマシン**
**RimWorldの実装**:
```typescript
enum AnimationState {
  IDLE,          // 待機（体重移動・まばたき）
  LOCOMOTION,    // 移動（歩行・走行）
  ACTION,        // 作業（タイピング・通話等）
  SOCIAL,        // 会話・交流
  EMOTIONAL      // 感情表現（喜び・ストレス）
}
```

**本プロジェクトへの適用**:
```typescript
// 各職種ごとに専用のアクションアニメーション
const JOB_ACTIONS = {
  developer: 'typing',      // タイピング動作
  sales: 'phone_call',      // 電話営業
  marketing: 'presenting',  // プレゼン動作
  manager: 'reviewing'      // 書類確認
};
```

### 3. **フレーム補間とスムージング**
**RimWorldの技術**:
- サブピクセル座標（小数点精度）で滑らかな移動
- イージング関数で自然な加速・減速
- ステート遷移時のブレンディング

**本プロジェクトへの適用**:
```typescript
// Phaser 3のTweenシステムを活用
this.scene.tweens.add({
  targets: sprite,
  x: targetX,
  y: targetY,
  duration: 500,
  ease: 'Sine.easeInOut'  // 自然な加速度
});
```

### 4. **深度ソートとZ-ordering**
**RimWorldの方式**:
- Y座標が大きい（画面下部）→ 手前に表示
- 同じY座標の場合はX座標で比較

**本プロジェクトへの適用**:
```typescript
// Phaserのdepthプロパティを動的に更新
sprite.depth = sprite.y;  // Y座標 = 描画深度
```

---

## 🎨 2Dシミュレーションゲームのベストプラクティス

### 1. **強いキーポーズ（Clear Silhouettes）**
**カイロソフトの手法**:
- 各職種の特徴的なポーズを強調
- シルエットだけで職種が識別可能

**実装方針**:
| 職種 | キーポーズ | 特徴的な要素 |
|------|----------|-------------|
| 開発者 | 前傾姿勢・キーボードに手 | ヘッドホン・フーディ |
| 営業 | 直立・電話を耳に当てる | スーツ・ネクタイ・ブリーフケース |
| 企画 | タブレット確認姿勢 | カジュアルジャケット・資料 |
| 管理 | 腕組み・書類確認 | フォーマルスーツ・腕時計 |

### 2. **セカンダリアクション（生き生きとした動き）**
**Prison Architect/RimWorldの手法**:
- 髪の揺れ
- 服の裾の動き
- まばたき・体重移動

**実装方針**:
- IDLE状態：2秒ごとに微妙な体重移動
- 移動時：髪・服が進行方向に揺れる
- 作業中：周期的な手の動き（タイピング・ページめくり等）

### 3. **視覚的ストーリーテリング**
**カイロソフトの手法**:
- 色・アクセサリー・表情で性格を表現
- 資格・経験が見た目に反映

**実装方針**:
```typescript
// 資格保有者は特別なバッジ表示
if (employee.qualification) {
  sprite.addChild(qualificationBadge);
}

// ストレスレベルで表情変化
if (employee.stress > 80) {
  sprite.setTexture('face_tired');
}
```

---

## 🛠️ 技術設計仕様

### スプライトシート構成

#### **解像度とフレーム数**
```
スプライトサイズ: 64x64px（48x48pxから拡大）
理由: ディテール表現力1.7倍、モダンディスプレイ対応

フレーム数:
- IDLE: 4フレーム（2秒ループ、0.5秒/フレーム）
- WALK: 8フレーム（1秒ループ、0.125秒/フレーム）
- ACTION: 6フレーム（1.5秒ループ、0.25秒/フレーム）
```

#### **方向性**
```
4方向対応: North, East, South, West
- East/Westは左右反転で対応（メモリ節約）
- 合計: (4+8+6) × 3方向 = 54フレーム/職種
```

#### **レイヤー構成**
```
各職種ごとに以下のレイヤー:
1. body_base.png      - 体・頭・肌（共通）
2. hair_[style].png   - 髪型（5バリエーション × 性別）
3. clothing_lower.png - 下衣（職種別）
4. clothing_upper.png - 上衣（職種別）
5. accessory.png      - アクセサリー（職種別）
6. badge.png          - 職種バッジ

オプション:
- face_[emotion].png - 表情（笑顔・疲労・集中）
- effect_[type].png  - エフェクト（汗・キラキラ）
```

---

## 🤖 AI生成スプライトの作成計画

### Phase 1: ツール選定とテスト生成（30分）

#### **候補ツール比較**
| ツール | 品質 | 速度 | コスト | ピクセルアート対応 | 推奨度 |
|--------|------|------|--------|-------------------|--------|
| **Pixela AI** | ⭐⭐⭐⭐⭐ | 速い | $20/月 | ✅ 特化 | ★★★★★ |
| **MageSpace** | ⭐⭐⭐⭐ | 普通 | 無料～ | ✅ 対応 | ★★★★ |
| **Stable Diffusion + LoRA** | ⭐⭐⭐⭐⭐ | 遅い | 無料 | ⚠️ 要調整 | ★★★ |
| **Aseprite + 手描き** | ⭐⭐⭐⭐⭐ | 極遅 | 無料 | ✅ 最適 | ★★ |

**推奨**: **Pixela AI**（ゲームスプライト特化、品質とスピードのバランス最高）

#### **テスト生成プロンプト（開発者）**
```
Prompt:
"pixel art game sprite sheet, 64x64 pixels,
business game character, software developer,
young adult male, casual blue hoodie, headphones,
sitting at desk typing on laptop,
4 frame idle animation + 8 frame walk cycle + 6 frame typing animation,
top-down 45-degree angle view,
clean pixel art style, transparent background PNG,
color palette: #4A90E2 blue theme"

Negative prompt:
"blurry, realistic, 3D, photo, complex background,
multiple characters, text, watermark"
```

### Phase 2: 全職種バッチ生成（2-3時間）

#### **生成マトリクス**
```
4職種 × 2性別 × 5レイヤー × 3アニメーション = 120スプライトシート

内訳:
- 開発者（男女）: 各10シート
- 営業（男女）: 各10シート
- 企画（男女）: 各10シート
- 管理（男女）: 各10シート
```

#### **ファイル命名規則**
```
{job}_{gender}_{layer}_{animation}_{direction}.png

例:
developer_male_body_idle_south.png
developer_male_clothing_walk_east.png
sales_female_accessory_action_north.png
```

### Phase 3: 後処理と最適化（1時間）

#### **品質チェック**
- [ ] 全フレームの整合性確認（位置ずれ・サイズ違い）
- [ ] 透過背景の完全性確認
- [ ] 色味の統一性確認

#### **最適化処理**
```bash
# PNGCrushで圧縮（品質劣化なし）
pngcrush -brute input.png output.png

# 一括処理スクリプト
for file in assets/sprites/*.png; do
  pngcrush -brute "$file" "optimized/${file##*/}"
done
```

---

## 💻 実装計画

### Step 1: アセットローダーの実装（1時間）

```typescript
// src/lib/animation/SpriteLoader.ts

export class SpriteLoader {
  private scene: Phaser.Scene;
  private loadedSprites: Map<string, boolean> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 全職種のスプライトシートを事前ロード
   */
  preloadAllSprites(): void {
    const jobs = ['developer', 'sales', 'marketing', 'manager'];
    const genders = ['male', 'female'];
    const layers = ['body', 'hair', 'clothing_lower', 'clothing_upper', 'accessory', 'badge'];
    const animations = ['idle', 'walk', 'action'];
    const directions = ['north', 'south', 'east'];

    jobs.forEach(job => {
      genders.forEach(gender => {
        layers.forEach(layer => {
          animations.forEach(anim => {
            directions.forEach(dir => {
              const key = `${job}_${gender}_${layer}_${anim}_${dir}`;
              const path = `assets/sprites/${job}/${key}.png`;

              this.scene.load.spritesheet(key, path, {
                frameWidth: 64,
                frameHeight: 64
              });
            });
          });
        });
      });
    });
  }

  /**
   * 動的にスプライトをロード（遅延ロード）
   */
  async loadSpriteOnDemand(
    job: string,
    gender: string,
    layer: string,
    animation: string,
    direction: string
  ): Promise<void> {
    const key = `${job}_${gender}_${layer}_${animation}_${direction}`;

    if (this.loadedSprites.has(key)) {
      return; // 既にロード済み
    }

    return new Promise((resolve, reject) => {
      const path = `assets/sprites/${job}/${key}.png`;

      this.scene.load.spritesheet(key, path, {
        frameWidth: 64,
        frameHeight: 64
      });

      this.scene.load.once('complete', () => {
        this.loadedSprites.set(key, true);
        resolve();
      });

      this.scene.load.once('loaderror', () => {
        console.error(`Failed to load sprite: ${key}`);
        reject(new Error(`Sprite load failed: ${key}`));
      });

      this.scene.load.start();
    });
  }
}
```

### Step 2: レイヤー合成システム（1.5時間）

```typescript
// src/lib/animation/LayeredCharacter.ts

export class LayeredCharacter {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private layers: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private currentState: AnimationState = AnimationState.IDLE;
  private currentDirection: Direction = Direction.SOUTH;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CharacterConfig) {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    this.buildLayers(config);
    this.setupAnimations(config);
  }

  /**
   * レイヤーを順番に構築
   */
  private buildLayers(config: CharacterConfig): void {
    const layerOrder = [
      'body',
      'clothing_lower',
      'clothing_upper',
      'hair',
      'accessory',
      'badge'
    ];

    layerOrder.forEach((layerName, index) => {
      const spriteKey = this.getSpriteKey(
        config.job,
        config.gender,
        layerName,
        this.currentState,
        this.currentDirection
      );

      const sprite = this.scene.add.sprite(0, 0, spriteKey);
      sprite.setDepth(index); // レイヤー順を保証

      this.layers.set(layerName, sprite);
      this.container.add(sprite);
    });

    // コンテナ全体のdepthをY座標に連動
    this.container.depth = y;
  }

  /**
   * 全レイヤーのアニメーションをセットアップ
   */
  private setupAnimations(config: CharacterConfig): void {
    const states = ['idle', 'walk', 'action'];
    const directions = ['north', 'south', 'east', 'west'];

    states.forEach(state => {
      directions.forEach(dir => {
        const animKey = `${config.job}_${state}_${dir}`;

        if (!this.scene.anims.exists(animKey)) {
          this.scene.anims.create({
            key: animKey,
            frames: this.scene.anims.generateFrameNumbers(
              this.getSpriteKey(config.job, config.gender, 'body', state, dir),
              { start: 0, end: this.getFrameCount(state) - 1 }
            ),
            frameRate: this.getFrameRate(state),
            repeat: -1  // 無限ループ
          });
        }
      });
    });
  }

  /**
   * アニメーション状態を変更（全レイヤー同期）
   */
  changeState(newState: AnimationState, direction?: Direction): void {
    if (direction) {
      this.currentDirection = direction;
    }

    this.currentState = newState;

    // 全レイヤーのアニメーションを同期再生
    this.layers.forEach((sprite, layerName) => {
      const animKey = `${this.config.job}_${newState}_${this.currentDirection}`;
      sprite.play(animKey, true);
    });
  }

  /**
   * 位置を更新（Tweenで滑らか移動）
   */
  moveTo(targetX: number, targetY: number, duration: number = 500): void {
    this.changeState(AnimationState.WALK, this.getDirectionTo(targetX, targetY));

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        // 移動中も深度を更新
        this.container.depth = this.container.y;
      },
      onComplete: () => {
        this.changeState(AnimationState.IDLE);
      }
    });
  }

  /**
   * ターゲット座標への方向を計算
   */
  private getDirectionTo(targetX: number, targetY: number): Direction {
    const dx = targetX - this.container.x;
    const dy = targetY - this.container.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.EAST : Direction.WEST;
    } else {
      return dy > 0 ? Direction.SOUTH : Direction.NORTH;
    }
  }

  /**
   * 表情レイヤーを動的に変更
   */
  setEmotion(emotion: 'happy' | 'tired' | 'focused' | 'stressed'): void {
    const faceLayer = this.layers.get('face');
    if (faceLayer) {
      faceLayer.setTexture(`face_${emotion}`);
    }
  }

  /**
   * エフェクトを追加（汗・キラキラ等）
   */
  addEffect(effectType: 'sweat' | 'sparkle' | 'zzz'): void {
    const effect = this.scene.add.sprite(0, -20, `effect_${effectType}`);
    effect.play(`effect_${effectType}_anim`);

    this.container.add(effect);

    // 3秒後に自動削除
    this.scene.time.delayedCall(3000, () => {
      effect.destroy();
    });
  }

  // ユーティリティメソッド
  private getSpriteKey(...args: string[]): string {
    return args.join('_');
  }

  private getFrameCount(state: string): number {
    const counts = { idle: 4, walk: 8, action: 6 };
    return counts[state] || 4;
  }

  private getFrameRate(state: string): number {
    const rates = { idle: 2, walk: 8, action: 4 };
    return rates[state] || 4;
  }

  // 公開API
  destroy(): void {
    this.container.destroy(true);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.container.depth = y;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }
}

// 型定義
enum AnimationState {
  IDLE = 'idle',
  WALK = 'walk',
  ACTION = 'action'
}

enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west'
}

interface CharacterConfig {
  job: 'developer' | 'sales' | 'marketing' | 'manager';
  gender: 'male' | 'female';
  skinTone?: number;  // 0-4
  hairStyle?: number; // 0-4
}
```

### Step 3: ゲームへの統合（1時間）

```typescript
// src/lib/game.ts に統合

import { LayeredCharacter } from './animation/LayeredCharacter';
import { SpriteLoader } from './animation/SpriteLoader';

// 初期化時
const spriteLoader = new SpriteLoader(phaserScene);
spriteLoader.preloadAllSprites();

// 従業員スプライト生成
function createEmployeeSprite(employee: Employee): LayeredCharacter {
  const config: CharacterConfig = {
    job: determineJobType(employee),
    gender: employee.gender || 'male',
    skinTone: employee.skinTone || 0,
    hairStyle: employee.hairStyle || 0
  };

  const sprite = new LayeredCharacter(
    phaserScene,
    100 + Math.random() * 600,
    100 + Math.random() * 300,
    config
  );

  return sprite;
}

// 既存のsyncAllEmployeeSprites()を置き換え
function syncAllEmployeeSprites(): void {
  game.employees.forEach((employee, index) => {
    if (!employee.sprite) {
      employee.sprite = createEmployeeSprite(employee);
    }

    // ストレスレベルで表情変化
    if (employee.stress > 80) {
      employee.sprite.setEmotion('stressed');
      employee.sprite.addEffect('sweat');
    } else if (employee.motivation > 90) {
      employee.sprite.setEmotion('happy');
      employee.sprite.addEffect('sparkle');
    }

    // 定期的にランダムな位置に移動（オフィス内巡回）
    if (Math.random() < 0.01) {  // 1%の確率で移動
      const targetX = 100 + Math.random() * 600;
      const targetY = 100 + Math.random() * 300;
      employee.sprite.moveTo(targetX, targetY, 2000);
    }
  });
}
```

---

## 📊 パフォーマンス最適化

### 1. **Object Pooling**
```typescript
// スプライトの再利用でメモリ確保コストを削減
class SpritePool {
  private pool: LayeredCharacter[] = [];

  acquire(config: CharacterConfig): LayeredCharacter {
    if (this.pool.length > 0) {
      const sprite = this.pool.pop()!;
      sprite.reconfigure(config);
      return sprite;
    }
    return new LayeredCharacter(scene, 0, 0, config);
  }

  release(sprite: LayeredCharacter): void {
    sprite.setVisible(false);
    this.pool.push(sprite);
  }
}
```

### 2. **画面外カリング**
```typescript
// 画面外のスプライトは更新を停止
function cullOffscreenSprites(): void {
  const cameraBounds = phaserScene.cameras.main.getBounds();

  game.employees.forEach(employee => {
    const pos = employee.sprite.getPosition();
    const isVisible = Phaser.Geom.Rectangle.Contains(
      cameraBounds,
      pos.x,
      pos.y
    );

    employee.sprite.setActive(isVisible);
    employee.sprite.setVisible(isVisible);
  });
}
```

### 3. **LOD (Level of Detail)**
```typescript
// ズームアウト時はアニメーションを簡略化
function updateLOD(): void {
  const zoom = phaserScene.cameras.main.zoom;

  if (zoom < 0.5) {
    // 極端にズームアウト → 静止画像のみ
    game.employees.forEach(e => e.sprite.changeState(AnimationState.IDLE));
  } else if (zoom < 1.0) {
    // 中距離 → フレームレート半減
    game.employees.forEach(e => e.sprite.setFrameRate(4));
  } else {
    // 通常距離 → フルアニメーション
    game.employees.forEach(e => e.sprite.setFrameRate(8));
  }
}
```

---

## ✅ 実装チェックリスト

### Phase 3C: AI生成スプライト導入（合計: 6-8時間）

#### **Part 1: 準備・ツール選定（1時間）**
- [ ] Pixela AIアカウント作成（無料トライアル）
- [ ] テストプロンプトで1職種生成
- [ ] 品質・スタイル評価
- [ ] 最終的なプロンプトテンプレート確定

#### **Part 2: スプライト生成（3時間）**
- [ ] 開発者（男女）: 各10シート生成
- [ ] 営業（男女）: 各10シート生成
- [ ] 企画（男女）: 各10シート生成
- [ ] 管理（男女）: 各10シート生成
- [ ] 後処理（透過背景確認・圧縮）

#### **Part 3: 実装（3時間）**
- [ ] `SpriteLoader.ts` 実装
- [ ] `LayeredCharacter.ts` 実装
- [ ] `game.ts` 統合
- [ ] 既存のプロシージャル生成コード削除

#### **Part 4: テスト・調整（1時間）**
- [ ] 全職種のビジュアル確認
- [ ] アニメーションの滑らかさ確認
- [ ] パフォーマンステスト（FPS 60維持）
- [ ] バグ修正

---

## 🎓 期待される効果

### ユーザー体験の向上
1. **視認性**: 遠目でも職種が一目で識別可能
2. **愛着**: キャラクターのビジュアルに感情移入できる
3. **没入感**: 滑らかなアニメーションでオフィスが「生きている」感覚
4. **多様性**: 性別・髪型・服装のバリエーションで個性表現

### 技術的メリット
1. **保守性**: プロシージャル生成の複雑なコードが不要に
2. **拡張性**: 新職種・新装備の追加が容易
3. **品質**: プロレベルのピクセルアート
4. **パフォーマンス**: 最適化により60FPS維持

---

## 📚 参考資料・引用

### 技術調査
- **RimWorld Animation Analysis**: Phaser tile-based rendering, layered sprite system
- **2D Simulation Best Practices**: Strong key poses, secondary actions, visual differentiation
- **Phaser 3.90 Documentation**: Sprite sheets, animation manager, tween system

### ツール
- **Pixela AI**: https://pixela.ai/ - ゲームスプライト特化AI
- **TexturePacker**: https://www.codeandweb.com/texturepacker - スプライトシート最適化
- **PNGCrush**: PNG圧縮（品質劣化なし）

---

## 🚀 次のステップ

1. **今すぐ開始**: Pixela AIアカウント作成とテスト生成（30分）
2. **本日中**: 1職種の完全なスプライトセット生成（2時間）
3. **明日**: 全職種バッチ生成 + 実装開始（4時間）
4. **2日後**: テスト・調整・完成（2時間）

**合計所要時間**: 8-10時間で**ゲームの見た目が劇的に改善**します！

---

**作成者**: Claude Code + AIチーム協働（Perplexity技術調査 + Gemini実装分析）
**次回更新**: Phase 3C完了後
**最終目標**: 「RimWorld × カイロソフト」級の高品質ビジュアル
