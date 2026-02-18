import Phaser from 'phaser'
import type { CharacterScene } from './CharacterRenderer'

/**
 * キャラクターエフェクトシステム
 * ストレス、集中、喜び、疲労などの視覚エフェクト
 */

export type EffectType =
  | 'sweat' // 汗（ストレス）
  | 'sparkle' // キラキラ（高パフォーマンス）
  | 'zzz' // 睡眠・疲労
  | 'heart' // モチベーション高
  | 'angry' // 怒り
  | 'idea' // ひらめき
  | 'money' // 売上達成
  | 'star' // レベルアップ
  | 'exclamation' // 緊急

interface EffectConfig {
  duration: number
  repeat: boolean
  offsetY: number
  scale: number
  color: number
}

const EFFECT_CONFIGS: Record<EffectType, EffectConfig> = {
  sweat: {
    duration: 3000,
    repeat: true,
    offsetY: -25,
    scale: 1.0,
    color: 0x6eb5ff
  },
  sparkle: {
    duration: 2000,
    repeat: false,
    offsetY: -20,
    scale: 1.2,
    color: 0xffd700
  },
  zzz: {
    duration: 4000,
    repeat: true,
    offsetY: -30,
    scale: 0.8,
    color: 0xcccccc
  },
  heart: {
    duration: 2500,
    repeat: false,
    offsetY: -25,
    scale: 1.0,
    color: 0xff69b4
  },
  angry: {
    duration: 3000,
    repeat: true,
    offsetY: -28,
    scale: 1.1,
    color: 0xff4444
  },
  idea: {
    duration: 2000,
    repeat: false,
    offsetY: -35,
    scale: 1.3,
    color: 0xffff00
  },
  money: {
    duration: 2000,
    repeat: false,
    offsetY: -22,
    scale: 1.0,
    color: 0x00ff00
  },
  star: {
    duration: 2500,
    repeat: false,
    offsetY: -30,
    scale: 1.4,
    color: 0xffd700
  },
  exclamation: {
    duration: 1500,
    repeat: false,
    offsetY: -32,
    scale: 1.2,
    color: 0xff0000
  }
}

/**
 * T8: オブジェクトプールクラス
 * Graphics/Textオブジェクトを再利用してGC負荷を軽減
 */
class ObjectPool<T extends Phaser.GameObjects.GameObject> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void

  constructor(createFn: () => T, resetFn: (obj: T) => void) {
    this.createFn = createFn
    this.resetFn = resetFn
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!
      obj.setActive(true)
      obj.setVisible(true)
      return obj
    }
    return this.createFn()
  }

  release(obj: T): void {
    this.resetFn(obj)
    obj.setActive(false)
    obj.setVisible(false)
    this.pool.push(obj)
  }

  clear(): void {
    this.pool.forEach(obj => obj.destroy())
    this.pool = []
  }
}

/**
 * キャラクターエフェクトマネージャー
 */
export class CharacterEffectManager {
  private scene: CharacterScene
  private activeEffects: Map<string, Phaser.GameObjects.Container> = new Map()

  // T8: オブジェクトプール
  private graphicsPool: ObjectPool<Phaser.GameObjects.Graphics>
  private textPool: ObjectPool<Phaser.GameObjects.Text>

  constructor(scene: CharacterScene) {
    this.scene = scene

    // T8: Graphicsプールの初期化
    this.graphicsPool = new ObjectPool<Phaser.GameObjects.Graphics>(
      () => this.scene.add.graphics(),
      (graphics) => {
        graphics.clear()
        graphics.setPosition(0, 0)
        graphics.setScale(1)
        graphics.setAlpha(1)
        graphics.setAngle(0)
      }
    )

    // T8: Textプールの初期化
    this.textPool = new ObjectPool<Phaser.GameObjects.Text>(
      () => this.scene.add.text(0, 0, '', {}),
      (text) => {
        text.setText('')
        text.setPosition(0, 0)
        text.setScale(1)
        text.setAlpha(1)
        text.setAngle(0)
        text.setOrigin(0.5)
      }
    )
  }

  /**
   * キャラクターにエフェクトを追加
   */
  addEffect(employeeId: string, effectType: EffectType): void {
    const characterContainer = this.scene.getAllCharacters().get(employeeId)
    if (!characterContainer) {
      console.warn(`[CharacterEffects] Character ${employeeId} not found`)
      return
    }

    // 既存のエフェクトがあれば削除
    this.removeEffect(employeeId)

    const config = EFFECT_CONFIGS[effectType]
    const effectContainer = this.createEffect(effectType, config)

    // キャラクターコンテナに追加
    characterContainer.add(effectContainer)

    // アクティブエフェクトに登録
    this.activeEffects.set(employeeId, effectContainer)

    // エフェクト終了後の処理
    if (!config.repeat) {
      this.scene.time.delayedCall(config.duration, () => {
        this.removeEffect(employeeId)
      })
    }

    console.log(`[CharacterEffects] Added ${effectType} effect to ${employeeId}`)
  }

  /**
   * エフェクトを作成
   */
  private createEffect(effectType: EffectType, config: EffectConfig): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, config.offsetY)

    switch (effectType) {
      case 'sweat':
        this.createSweatEffect(container, config)
        break
      case 'sparkle':
        this.createSparkleEffect(container, config)
        break
      case 'zzz':
        this.createZzzEffect(container, config)
        break
      case 'heart':
        this.createHeartEffect(container, config)
        break
      case 'angry':
        this.createAngryEffect(container, config)
        break
      case 'idea':
        this.createIdeaEffect(container, config)
        break
      case 'money':
        this.createMoneyEffect(container, config)
        break
      case 'star':
        this.createStarEffect(container, config)
        break
      case 'exclamation':
        this.createExclamationEffect(container, config)
        break
    }

    return container
  }

  /**
   * 汗エフェクト（ストレス）
   */
  private createSweatEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const sweat1 = this.createParticle(8, 0, 0x6eb5ff, 0.8)
    const sweat2 = this.createParticle(8, 5, 0x6eb5ff, 0.6)

    container.add([sweat1, sweat2])

    // アニメーション: 下に落ちる
    this.scene.tweens.add({
      targets: [sweat1, sweat2],
      y: '+=15',
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeIn',
      repeat: config.repeat ? -1 : 0,
      yoyo: false
    })
  }

  /**
   * キラキラエフェクト（高パフォーマンス）
   */
  private createSparkleEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      const distance = 15
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      const sparkle = this.createStar(6, config.color, 1.0)
      sparkle.setPosition(x, y)
      sparkle.setScale(0.5)

      container.add(sparkle)

      // アニメーション: 拡大して消える
      this.scene.tweens.add({
        targets: sparkle,
        scale: config.scale,
        alpha: 0,
        duration: config.duration,
        ease: 'Quad.easeOut',
        delay: i * 100
      })
    }
  }

  /**
   * Zzzエフェクト（疲労・睡眠）
   * T8: Textプールを使用
   */
  private createZzzEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const text = this.textPool.acquire()
    text.setText('Zzz')
    text.setStyle({
      fontSize: '16px',
      color: '#cccccc',
      fontStyle: 'italic'
    })
    text.setOrigin(0.5)
    text.setPosition(0, 0)

    container.add(text)

    // アニメーション: 上に浮かぶ
    this.scene.tweens.add({
      targets: text,
      y: '-=20',
      alpha: 0,
      duration: 2000,
      ease: 'Sine.easeOut',
      repeat: config.repeat ? -1 : 0
    })
  }

  /**
   * ハートエフェクト（モチベーション高）
   */
  private createHeartEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const heart = this.createHeart(10, config.color)
    container.add(heart)

    // アニメーション: 跳ねて消える
    this.scene.tweens.add({
      targets: heart,
      y: '-=25',
      scale: config.scale * 1.5,
      alpha: 0,
      duration: config.duration,
      ease: 'Back.easeOut'
    })
  }

  /**
   * 怒りエフェクト
   */
  private createAngryEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const mark1 = this.createCross(8, config.color)
    const mark2 = this.createCross(6, config.color)
    mark2.setPosition(10, -5)

    container.add([mark1, mark2])

    // アニメーション: 点滅
    this.scene.tweens.add({
      targets: [mark1, mark2],
      alpha: 0.3,
      duration: 400,
      ease: 'Sine.easeInOut',
      repeat: config.repeat ? -1 : 3,
      yoyo: true
    })
  }

  /**
   * ひらめきエフェクト
   */
  private createIdeaEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const bulb = this.createLightBulb(12, config.color)
    container.add(bulb)

    // アニメーション: 明滅しながら上昇
    this.scene.tweens.add({
      targets: bulb,
      y: '-=15',
      scale: config.scale,
      duration: config.duration,
      ease: 'Sine.easeOut'
    })

    this.scene.tweens.add({
      targets: bulb,
      alpha: 0.5,
      duration: 200,
      ease: 'Sine.easeInOut',
      repeat: 6,
      yoyo: true
    })
  }

  /**
   * お金エフェクト（売上達成）
   */
  private createMoneyEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const coin = this.createCoin(10, config.color)
    container.add(coin)

    // アニメーション: 回転しながら上昇
    this.scene.tweens.add({
      targets: coin,
      y: '-=30',
      alpha: 0,
      duration: config.duration,
      ease: 'Quad.easeOut'
    })

    this.scene.tweens.add({
      targets: coin,
      angle: 720,
      duration: config.duration,
      ease: 'Linear'
    })
  }

  /**
   * 星エフェクト（レベルアップ）
   */
  private createStarEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const star = this.createStar(12, config.color, 1.0)
    container.add(star)

    // アニメーション: 拡大しながら上昇
    this.scene.tweens.add({
      targets: star,
      y: '-=25',
      scale: config.scale,
      alpha: 0,
      duration: config.duration,
      ease: 'Back.easeOut'
    })

    this.scene.tweens.add({
      targets: star,
      angle: 360,
      duration: config.duration,
      ease: 'Linear'
    })
  }

  /**
   * ビックリマークエフェクト
   * T8: Textプールを使用
   */
  private createExclamationEffect(container: Phaser.GameObjects.Container, config: EffectConfig): void {
    const text = this.textPool.acquire()
    text.setText('!')
    text.setStyle({
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold'
    })
    text.setOrigin(0.5)
    text.setPosition(0, 0)

    container.add(text)

    // アニメーション: 拡大して点滅
    this.scene.tweens.add({
      targets: text,
      scale: config.scale * 1.3,
      duration: 200,
      ease: 'Back.easeOut',
      yoyo: true,
      repeat: 3
    })
  }

  /**
   * エフェクトを削除
   * T8: オブジェクトをプールに戻す
   */
  removeEffect(employeeId: string): void {
    const effect = this.activeEffects.get(employeeId)
    if (effect) {
      this.scene.tweens.killTweensOf(effect.list)

      // T8: 子オブジェクトをプールに戻す
      effect.list.forEach((child) => {
        if (child instanceof Phaser.GameObjects.Graphics) {
          this.graphicsPool.release(child)
        } else if (child instanceof Phaser.GameObjects.Text) {
          this.textPool.release(child)
        }
      })

      effect.removeAll(false) // destroy=falseでプールに戻したオブジェクトを保持
      effect.destroy()
      this.activeEffects.delete(employeeId)
    }
  }

  /**
   * すべてのエフェクトをクリア
   */
  clearAll(): void {
    this.activeEffects.forEach((effect, employeeId) => {
      this.removeEffect(employeeId)
    })

    // T8: プールもクリア
    this.graphicsPool.clear()
    this.textPool.clear()
  }

  // ========== プリミティブ図形生成（T8: プール対応） ==========

  private createParticle(size: number, x: number, color: number, alpha: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()
    graphics.fillStyle(color, alpha)
    graphics.fillCircle(0, 0, size / 2)
    graphics.setPosition(x, 0)
    return graphics
  }

  private createStar(size: number, color: number, alpha: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()
    graphics.fillStyle(color, alpha)

    const points: Phaser.Math.Vector2[] = []
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10 - Math.PI / 2
      const radius = i % 2 === 0 ? size : size / 2
      points.push(new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius))
    }

    graphics.fillPoints(points, true)
    return graphics
  }

  private createHeart(size: number, color: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()
    graphics.fillStyle(color, 1.0)

    const path = new Phaser.Curves.Path(0, size / 4)
    path.cubicBezierTo(
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(-size, 0),
      new Phaser.Math.Vector2(-size, size / 2)
    )
    path.cubicBezierTo(
      new Phaser.Math.Vector2(-size, size * 1.2),
      new Phaser.Math.Vector2(0, size * 1.5),
      new Phaser.Math.Vector2(0, size * 1.8)
    )
    path.cubicBezierTo(
      new Phaser.Math.Vector2(0, size * 1.5),
      new Phaser.Math.Vector2(size, size * 1.2),
      new Phaser.Math.Vector2(size, size / 2)
    )
    path.cubicBezierTo(
      new Phaser.Math.Vector2(size, 0),
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, size / 4)
    )

    path.draw(graphics)
    graphics.fillPath()

    return graphics
  }

  private createCross(size: number, color: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()
    graphics.lineStyle(3, color, 1.0)

    graphics.lineBetween(-size, -size, size, size)
    graphics.lineBetween(-size, size, size, -size)

    return graphics
  }

  private createLightBulb(size: number, color: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()

    // 電球の光部分
    graphics.fillStyle(color, 1.0)
    graphics.fillCircle(0, 0, size)

    // ハイライト
    graphics.fillStyle(0xffffff, 0.6)
    graphics.fillCircle(-size / 3, -size / 3, size / 3)

    return graphics
  }

  private createCoin(size: number, color: number): Phaser.GameObjects.Graphics {
    const graphics = this.graphicsPool.acquire()

    graphics.fillStyle(color, 1.0)
    graphics.fillCircle(0, 0, size)

    graphics.lineStyle(2, 0xffff00, 1.0)
    graphics.strokeCircle(0, 0, size)

    return graphics
  }
}
