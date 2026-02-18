import Phaser from 'phaser'
import { CharacterMovementManager } from './CharacterMovement'
import { CharacterEffectManager, type EffectType } from './CharacterEffects'
export { CharacterMovementManager, CharacterEffectManager }
export type { EffectType }

export type AnimationState = 'idle' | 'working' | 'stressed'
export type JobType = 'developer' | 'sales' | 'marketing' | 'manager'

type CharacterLayerKey = 'base' | 'clothing_bottom' | 'clothing_top' | 'accessory' | 'badge'

interface CharacterLayerSprites {
  base: Phaser.GameObjects.Sprite
  clothing_bottom: Phaser.GameObjects.Sprite
  clothing_top: Phaser.GameObjects.Sprite
  accessory: Phaser.GameObjects.Sprite
  badge: Phaser.GameObjects.Sprite
}

interface FramePose {
  index: number
  isWorking: boolean
  bodyOffsetY: number
  armOffsetY: number
  armSwing: number
}

interface JobVisual {
  themeColor: string
  bottomColor: string
  bottomAccent: string
  shoeColor: string
  topPrimary: string
  topSecondary: string
  topDetail: string
  accessoryPrimary: string
  accessorySecondary: string
  badgePrimary: string
  badgeSecondary: string
  hairPrimary: string
  hairSecondary: string
}

const FRAME_WIDTH = 48
const FRAME_HEIGHT = 48
const FRAME_COUNT = 8
const SKIN_COLOR = '#ffdbac'
const OUTLINE_COLOR = '#2d3748'
const EYE_COLOR = '#0f172a'
const MOUTH_COLOR = '#2d1f18'

const JOB_TYPES: JobType[] = ['developer', 'sales', 'marketing', 'manager']

const JOB_VISUALS: Record<JobType, JobVisual> = {
  developer: {
    themeColor: '#4A90E2',
    bottomColor: '#264a7a',
    bottomAccent: '#345d95',
    shoeColor: '#1a2433',
    topPrimary: '#4A90E2',
    topSecondary: '#78b3ff',
    topDetail: '#396fb6',
    accessoryPrimary: '#1f2937',
    accessorySecondary: '#cbd5f5',
    badgePrimary: '#4A90E2',
    badgeSecondary: '#cfe2ff',
    hairPrimary: '#3b2d20',
    hairSecondary: '#5b4532'
  },
  sales: {
    themeColor: '#FF6B6B',
    bottomColor: '#1f1f25',
    bottomAccent: '#32323a',
    shoeColor: '#16161c',
    topPrimary: '#2e3440',
    topSecondary: '#3a4252',
    topDetail: '#FF6B6B',
    accessoryPrimary: '#FF6B6B',
    accessorySecondary: '#2e3440',
    badgePrimary: '#FF6B6B',
    badgeSecondary: '#ffe0de',
    hairPrimary: '#2b2722',
    hairSecondary: '#3d362f'
  },
  marketing: {
    themeColor: '#50E3C2',
    bottomColor: '#c4a978',
    bottomAccent: '#b99762',
    shoeColor: '#6c584c',
    topPrimary: '#4ecfb2',
    topSecondary: '#6fe9c8',
    topDetail: '#2c9e83',
    accessoryPrimary: '#2c9e83',
    accessorySecondary: '#ffffff',
    badgePrimary: '#50E3C2',
    badgeSecondary: '#193e35',
    hairPrimary: '#3f2c45',
    hairSecondary: '#8f6e9c'
  },
  manager: {
    themeColor: '#34495E',
    bottomColor: '#1f2a36',
    bottomAccent: '#2b3846',
    shoeColor: '#161f26',
    topPrimary: '#34495E',
    topSecondary: '#415d78',
    topDetail: '#ffffff',
    accessoryPrimary: '#c0c6cf',
    accessorySecondary: '#34495E',
    badgePrimary: '#34495E',
    badgeSecondary: '#dbe4ee',
    hairPrimary: '#26272b',
    hairSecondary: '#3a3b42'
  }
}

const LAYER_KEYS: CharacterLayerKey[] = ['base', 'clothing_bottom', 'clothing_top', 'accessory', 'badge']

function getFramePose(frameIndex: number): FramePose {
  if (frameIndex < 4) {
    const idleConfig = [
      { bodyOffsetY: 0, armOffsetY: 0, armSwing: 0 },
      { bodyOffsetY: -1, armOffsetY: -1, armSwing: 0 },
      { bodyOffsetY: 0, armOffsetY: 0, armSwing: 0 },
      { bodyOffsetY: 1, armOffsetY: 1, armSwing: 0 }
    ]
    const config = idleConfig[frameIndex] ?? idleConfig[0]
    return {
      index: frameIndex,
      isWorking: false,
      bodyOffsetY: config.bodyOffsetY,
      armOffsetY: config.armOffsetY,
      armSwing: config.armSwing
    }
  }

  const workingFrame = frameIndex - 4
  const workingConfig = [
    { bodyOffsetY: 0, armOffsetY: -1, armSwing: 0 },
    { bodyOffsetY: -1, armOffsetY: -2, armSwing: 1 },
    { bodyOffsetY: 0, armOffsetY: -1, armSwing: -1 },
    { bodyOffsetY: -1, armOffsetY: -2, armSwing: 0 }
  ]
  const config = workingConfig[workingFrame] ?? workingConfig[0]
  return {
    index: frameIndex,
    isWorking: true,
    bodyOffsetY: config.bodyOffsetY,
    armOffsetY: config.armOffsetY,
    armSwing: config.armSwing
  }
}

function addOrReplaceSpriteSheet(
  textures: Phaser.Textures.TextureManager,
  key: string,
  canvas: HTMLCanvasElement
): void {
  if (textures.exists(key)) {
    textures.remove(key)
  }
  textures.addSpriteSheet(key, canvas, {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    endFrame: FRAME_COUNT - 1
  })
}

export class CharacterScene extends Phaser.Scene {
  private characterSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private baseTextureKey = 'character-layer-base'
  public movementManager!: CharacterMovementManager
  public effectManager!: CharacterEffectManager

  // T7: 合成テクスチャキャッシュ
  private compositeTextureCache: Map<string, string> = new Map()

  private layerTextureCache: Record<JobType, Record<CharacterLayerKey, string>> = {
    developer: { base: this.baseTextureKey, clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    sales: { base: this.baseTextureKey, clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    marketing: { base: this.baseTextureKey, clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    manager: { base: this.baseTextureKey, clothing_bottom: '', clothing_top: '', accessory: '', badge: '' }
  }

  private layerAnimationKeyBases: Record<JobType, Record<CharacterLayerKey, string>> = {
    developer: { base: 'character-base', clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    sales: { base: 'character-base', clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    marketing: { base: 'character-base', clothing_bottom: '', clothing_top: '', accessory: '', badge: '' },
    manager: { base: 'character-base', clothing_bottom: '', clothing_top: '', accessory: '', badge: '' }
  }

  constructor() {
    super({ key: 'CharacterScene' })
  }

  preload() {
    console.log('[CharacterScene] Preloading assets...')
  }

  create() {
    console.log('[CharacterScene] Creating multi-layer procedural sprites...')
    this.generateBaseLayer()
    this.generateJobLayers()

    // T7: 各職種の合成テクスチャを事前生成
    this.generateCompositeTextures()

    // Initialize movement manager
    this.movementManager = new CharacterMovementManager(this, {
      speed: 80,
      idleDuration: 2000,
      moveChance: 0.25,
      bounds: { x: 50, y: 50, width: 700, height: 500 }
    })

    // Initialize effect manager
    this.effectManager = new CharacterEffectManager(this)

    // Setup camera controls
    this.setupCameraControls()

    console.log('[CharacterScene] Multi-layer textures & animations ready for job types:', JOB_TYPES.join(', '))
    console.log('[CharacterScene] Movement manager initialized')
    console.log('[CharacterScene] Effect manager initialized')
  }

  /**
   * T7: 各職種の5レイヤーを1枚のテクスチャに合成
   */
  private generateCompositeTextures(): void {
    JOB_TYPES.forEach((jobType) => {
      const compositeKey = `character-composite-${jobType}`

      // RenderTextureを使って5レイヤーを合成
      const renderTexture = this.add.renderTexture(0, 0, FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT)
      renderTexture.setVisible(false)

      // 各フレームに対してレイヤーを描画
      for (let frame = 0; frame < FRAME_COUNT; frame++) {
        const xOffset = frame * FRAME_WIDTH

        // 各レイヤーを順番に描画
        const baseTexture = this.textures.getFrame(this.baseTextureKey, frame)
        if (baseTexture) {
          renderTexture.draw(this.baseTextureKey, xOffset, 0, 1, undefined, undefined, frame)
        }

        const bottomKey = this.layerTextureCache[jobType].clothing_bottom
        if (bottomKey) {
          renderTexture.draw(bottomKey, xOffset, 0, 1, undefined, undefined, frame)
        }

        const topKey = this.layerTextureCache[jobType].clothing_top
        if (topKey) {
          renderTexture.draw(topKey, xOffset, 0, 1, undefined, undefined, frame)
        }

        const accessoryKey = this.layerTextureCache[jobType].accessory
        if (accessoryKey) {
          renderTexture.draw(accessoryKey, xOffset, 0, 1, undefined, undefined, frame)
        }

        const badgeKey = this.layerTextureCache[jobType].badge
        if (badgeKey) {
          renderTexture.draw(badgeKey, xOffset, 0, 1, undefined, undefined, frame)
        }
      }

      // RenderTextureをテクスチャとして保存
      renderTexture.saveTexture(compositeKey)

      // スプライトシートとして再登録
      if (this.textures.exists(compositeKey)) {
        const texture = this.textures.get(compositeKey)
        // フレームを追加
        for (let i = 0; i < FRAME_COUNT; i++) {
          texture.add(i, 0, i * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT)
        }
      }

      // アニメーションを登録
      this.registerAnimations(compositeKey, `character-composite-${jobType}`)

      // キャッシュに登録
      this.compositeTextureCache.set(jobType, compositeKey)

      // RenderTextureを破棄（テクスチャは保持される）
      renderTexture.destroy()

      console.log(`[CharacterScene] Generated composite texture for ${jobType}`)
    })
  }

  /**
   * カメラコントロールをセットアップ
   */
  private setupCameraControls(): void {
    const camera = this.cameras.main

    // 初期ズームとカメラ位置
    camera.setZoom(1)
    camera.centerOn(400, 300)

    // マウスホイールでズーム
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const zoomAmount = deltaY > 0 ? -0.1 : 0.1
      const newZoom = Phaser.Math.Clamp(camera.zoom + zoomAmount, 0.5, 2.0)

      this.tweens.add({
        targets: camera,
        zoom: newZoom,
        duration: 200,
        ease: 'Sine.easeOut'
      })
    })

    // ダブルクリックでズームリセット
    this.input.on('pointerdown', (pointer: any) => {
      if (pointer.downTime - pointer.upTime < 300 && pointer.upTime > 0) {
        this.tweens.add({
          targets: camera,
          zoom: 1.0,
          scrollX: 0,
          scrollY: 0,
          duration: 400,
          ease: 'Sine.easeInOut'
        })
      }
    })

    console.log('[CharacterScene] Camera controls enabled (Mouse wheel: zoom, Double-click: reset)')
  }

  update(time: number, delta: number) {
    if (this.movementManager) {
      this.movementManager.update(time, delta)
    }
  }

  private generateBaseLayer(): void {
    const canvas = document.createElement('canvas')
    canvas.width = FRAME_WIDTH * FRAME_COUNT
    canvas.height = FRAME_HEIGHT
    const ctx = canvas.getContext('2d')!
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    const neutralClothingColor = '#c0cad8'

    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const pose = getFramePose(frame)
      const xOffset = frame * FRAME_WIDTH
      const centerX = xOffset + FRAME_WIDTH / 2
      const centerY = FRAME_HEIGHT / 2

      ctx.clearRect(xOffset, 0, FRAME_WIDTH, FRAME_HEIGHT)

      ctx.strokeStyle = OUTLINE_COLOR
      ctx.lineWidth = 2
      const legY = centerY + 12 + pose.bodyOffsetY
      ctx.strokeRect(centerX - 6.5, legY, 4, 8)
      ctx.strokeRect(centerX + 2.5, legY, 4, 8)

      ctx.fillStyle = neutralClothingColor
      ctx.fillRect(centerX - 5, legY + 1, 3, 7)
      ctx.fillRect(centerX + 3, legY + 1, 3, 7)

      ctx.beginPath()
      ctx.roundRect(centerX - 11, centerY + 2 + pose.bodyOffsetY, 22, 16, 3)
      ctx.stroke()

      ctx.fillStyle = neutralClothingColor
      ctx.beginPath()
      ctx.roundRect(centerX - 10, centerY + 3 + pose.bodyOffsetY, 20, 14, 3)
      ctx.fill()

      if (pose.isWorking) {
        ctx.strokeRect(centerX - 14, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY, 5, 10)
        ctx.strokeRect(centerX + 9, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 5, 10)
      } else {
        ctx.strokeRect(centerX - 13, centerY + 4 + pose.bodyOffsetY + pose.armOffsetY, 4, 12)
        ctx.strokeRect(centerX + 9, centerY + 4 + pose.bodyOffsetY + pose.armOffsetY, 4, 12)
      }

      ctx.fillStyle = neutralClothingColor
      if (pose.isWorking) {
        ctx.fillRect(centerX - 13, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY, 4, 9)
        ctx.fillRect(centerX + 10, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 4, 9)
      } else {
        ctx.fillRect(centerX - 12, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY, 3, 11)
        ctx.fillRect(centerX + 10, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY, 3, 11)
      }

      ctx.fillStyle = SKIN_COLOR
      const faceCenterY = centerY - 8 + pose.bodyOffsetY
      ctx.beginPath()
      ctx.arc(centerX, faceCenterY, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillRect(centerX - 13, centerY + 14 + pose.bodyOffsetY + pose.armOffsetY, 4, 3)
      ctx.fillRect(centerX + 10, centerY + 14 + pose.bodyOffsetY + pose.armOffsetY + (pose.isWorking ? pose.armSwing : 0), 4, 3)

      ctx.fillStyle = EYE_COLOR
      ctx.beginPath()
      ctx.arc(centerX - 3, centerY - 10 + pose.bodyOffsetY, 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + 3, centerY - 10 + pose.bodyOffsetY, 1.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = MOUTH_COLOR
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (pose.isWorking) {
        ctx.moveTo(centerX - 3, centerY - 5 + pose.bodyOffsetY)
        ctx.lineTo(centerX + 3, centerY - 5 + pose.bodyOffsetY)
      } else {
        ctx.arc(centerX, centerY - 7 + pose.bodyOffsetY, 3, 0.2 * Math.PI, Math.PI - 0.2 * Math.PI)
      }
      ctx.stroke()
    }

    addOrReplaceSpriteSheet(this.textures, this.baseTextureKey, canvas)
    if (!this.anims.exists('character-base-idle')) {
      this.registerAnimations(this.baseTextureKey, 'character-base')
    }
  }

  private generateJobLayers(): void {
    JOB_TYPES.forEach((jobType) => {
      const visuals = JOB_VISUALS[jobType]

      const clothingBottomKey = `character-${jobType}-bottom`
      this.createLayerTexture(clothingBottomKey, (ctx, frame, pose, centerX, centerY) => {
        this.drawClothingBottom(ctx, pose, centerX, centerY, visuals)
      })
      this.layerTextureCache[jobType].clothing_bottom = clothingBottomKey
      this.layerAnimationKeyBases[jobType].clothing_bottom = `character-${jobType}-bottom`
      this.registerAnimations(clothingBottomKey, `character-${jobType}-bottom`)

      const clothingTopKey = `character-${jobType}-top`
      this.createLayerTexture(clothingTopKey, (ctx, frame, pose, centerX, centerY) => {
        this.drawClothingTop(ctx, frame, pose, centerX, centerY, jobType, visuals)
      })
      this.layerTextureCache[jobType].clothing_top = clothingTopKey
      this.layerAnimationKeyBases[jobType].clothing_top = `character-${jobType}-top`
      this.registerAnimations(clothingTopKey, `character-${jobType}-top`)

      const accessoryKey = `character-${jobType}-accessory`
      this.createLayerTexture(accessoryKey, (ctx, frame, pose, centerX, centerY) => {
        this.drawAccessory(ctx, frame, pose, centerX, centerY, jobType, visuals)
      })
      this.layerTextureCache[jobType].accessory = accessoryKey
      this.layerAnimationKeyBases[jobType].accessory = `character-${jobType}-accessory`
      this.registerAnimations(accessoryKey, `character-${jobType}-accessory`)

      const badgeKey = `character-${jobType}-badge`
      this.createLayerTexture(badgeKey, (ctx, frame, pose, centerX, centerY) => {
        this.drawBadge(ctx, frame, pose, centerX, centerY, jobType, visuals)
      })
      this.layerTextureCache[jobType].badge = badgeKey
      this.layerAnimationKeyBases[jobType].badge = `character-${jobType}-badge`
      this.registerAnimations(badgeKey, `character-${jobType}-badge`)
    })
  }

  private createLayerTexture(
    textureKey: string,
    drawFrame: (
      ctx: CanvasRenderingContext2D,
      frameIndex: number,
      pose: FramePose,
      centerX: number,
      centerY: number
    ) => void
  ): void {
    const canvas = document.createElement('canvas')
    canvas.width = FRAME_WIDTH * FRAME_COUNT
    canvas.height = FRAME_HEIGHT
    const ctx = canvas.getContext('2d')!
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const pose = getFramePose(frame)
      const xOffset = frame * FRAME_WIDTH
      const centerX = xOffset + FRAME_WIDTH / 2
      const centerY = FRAME_HEIGHT / 2

      ctx.clearRect(xOffset, 0, FRAME_WIDTH, FRAME_HEIGHT)
      ctx.save()
      ctx.translate(xOffset, 0)
      drawFrame(ctx, frame, pose, FRAME_WIDTH / 2, centerY)
      ctx.restore()
    }

    addOrReplaceSpriteSheet(this.textures, textureKey, canvas)
  }

  private registerAnimations(textureKey: string, animationKeyBase: string): void {
    this.ensureAnimation(animationKeyBase, 'idle', textureKey, 0, 3, 2)
    this.ensureAnimation(animationKeyBase, 'working', textureKey, 4, 7, 5)
    this.ensureAnimation(animationKeyBase, 'stressed', textureKey, 4, 7, 9)
  }

  private ensureAnimation(
    animationKeyBase: string,
    state: AnimationState,
    textureKey: string,
    start: number,
    end: number,
    frameRate: number
  ): void {
    const key = this.composeAnimationKey(animationKeyBase, state)
    if (this.anims.exists(key)) {
      return
    }

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(textureKey, { start, end }),
      frameRate,
      repeat: -1
    })
  }

  private drawClothingBottom(
    ctx: CanvasRenderingContext2D,
    pose: FramePose,
    centerX: number,
    centerY: number,
    visuals: JobVisual
  ): void {
    const legBaseY = centerY + 13 + pose.bodyOffsetY
    const legMovement = pose.isWorking ? (pose.index % 2 === 0 ? 0 : -1) : 0
    ctx.fillStyle = visuals.bottomColor
    ctx.fillRect(centerX - 5, legBaseY + legMovement, 3, 7 - legMovement)
    ctx.fillRect(centerX + 3, legBaseY - legMovement, 3, 7 + legMovement)

    ctx.fillStyle = visuals.bottomAccent
    ctx.fillRect(centerX - 5, legBaseY + legMovement, 3, 2)
    ctx.fillRect(centerX + 3, legBaseY - legMovement, 3, 2)

    ctx.fillStyle = visuals.shoeColor
    ctx.fillRect(centerX - 6, legBaseY + 6, 5, 2)
    ctx.fillRect(centerX + 3, legBaseY + 6, 5, 2)
  }

  private drawClothingTop(
    ctx: CanvasRenderingContext2D,
    frame: number,
    pose: FramePose,
    centerX: number,
    centerY: number,
    jobType: JobType,
    visuals: JobVisual
  ): void {
    const torsoY = centerY + 3 + pose.bodyOffsetY
    ctx.fillStyle = visuals.topPrimary
    ctx.beginPath()
    ctx.roundRect(centerX - 10, torsoY, 20, 14, 3)
    ctx.fill()

    ctx.fillStyle = visuals.topSecondary
    ctx.fillRect(centerX - 9, torsoY + 1, 18, 5)

    this.drawSleeves(ctx, pose, centerX, centerY, visuals.topPrimary, visuals.topSecondary)
    this.drawHands(ctx, pose, centerX, centerY)
    this.drawJobSpecificTopDetails(ctx, frame, pose, centerX, centerY, jobType, visuals)
    this.drawHair(ctx, pose, centerX, centerY, jobType, visuals)
  }

  private drawSleeves(
    ctx: CanvasRenderingContext2D,
    pose: FramePose,
    centerX: number,
    centerY: number,
    primaryColor: string,
    secondaryColor: string
  ): void {
    ctx.fillStyle = primaryColor
    if (pose.isWorking) {
      ctx.fillRect(centerX - 13, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY, 4, 7)
      ctx.fillRect(centerX + 10, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 4, 7)

      ctx.fillStyle = secondaryColor
      ctx.fillRect(centerX - 13, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + 5, 4, 2)
      ctx.fillRect(centerX + 10, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing + 5, 4, 2)
    } else {
      ctx.fillRect(centerX - 12, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY, 3, 9)
      ctx.fillRect(centerX + 10, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY, 3, 9)

      ctx.fillStyle = secondaryColor
      ctx.fillRect(centerX - 12, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY + 6, 3, 2)
      ctx.fillRect(centerX + 10, centerY + 5 + pose.bodyOffsetY + pose.armOffsetY + 6, 3, 2)
    }
  }

  private drawHands(ctx: CanvasRenderingContext2D, pose: FramePose, centerX: number, centerY: number): void {
    ctx.fillStyle = SKIN_COLOR
    const baseY = centerY + 12 + pose.bodyOffsetY + pose.armOffsetY
    if (pose.isWorking) {
      ctx.fillRect(centerX - 13, baseY + 3, 4, 3)
      ctx.fillRect(centerX + 10, baseY + 3 + pose.armSwing, 4, 3)
    } else {
      ctx.fillRect(centerX - 12, baseY + 4, 3, 3)
      ctx.fillRect(centerX + 10, baseY + 4, 3, 3)
    }
  }

  private drawJobSpecificTopDetails(
    ctx: CanvasRenderingContext2D,
    frame: number,
    pose: FramePose,
    centerX: number,
    centerY: number,
    jobType: JobType,
    visuals: JobVisual
  ): void {
    switch (jobType) {
      case 'developer': {
        ctx.fillStyle = visuals.topDetail
        ctx.fillRect(centerX - 6, centerY + 8 + pose.bodyOffsetY, 12, 4)
        ctx.strokeStyle = visuals.topSecondary
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(centerX - 5, centerY + 5 + pose.bodyOffsetY)
        ctx.lineTo(centerX - 2, centerY + 7 + pose.bodyOffsetY)
        ctx.moveTo(centerX + 5, centerY + 5 + pose.bodyOffsetY)
        ctx.lineTo(centerX + 2, centerY + 7 + pose.bodyOffsetY)
        ctx.stroke()
        break
      }
      case 'sales': {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(centerX - 4, centerY + 4 + pose.bodyOffsetY, 8, 6)
        ctx.fillStyle = visuals.topDetail
        ctx.beginPath()
        ctx.moveTo(centerX, centerY + 4 + pose.bodyOffsetY)
        ctx.lineTo(centerX - 2, centerY + 10 + pose.bodyOffsetY)
        ctx.lineTo(centerX + 2, centerY + 10 + pose.bodyOffsetY)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = visuals.topSecondary
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(centerX - 9, centerY + 4 + pose.bodyOffsetY)
        ctx.lineTo(centerX - 4, centerY + 12 + pose.bodyOffsetY)
        ctx.moveTo(centerX + 9, centerY + 4 + pose.bodyOffsetY)
        ctx.lineTo(centerX + 4, centerY + 12 + pose.bodyOffsetY)
        ctx.stroke()
        break
      }
      case 'marketing': {
        ctx.fillStyle = visuals.topDetail
        ctx.fillRect(centerX - 8, centerY + 10 + pose.bodyOffsetY, 16, 3)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(centerX - 3, centerY + 5 + pose.bodyOffsetY, 6, 5)
        ctx.fillStyle = visuals.topSecondary
        ctx.fillRect(centerX - 10, centerY + 4 + pose.bodyOffsetY, 3, 12)
        ctx.fillRect(centerX + 7, centerY + 4 + pose.bodyOffsetY, 3, 12)
        break
      }
      case 'manager': {
        ctx.fillStyle = visuals.topDetail
        ctx.fillRect(centerX - 4, centerY + 4 + pose.bodyOffsetY, 8, 2)
        ctx.fillRect(centerX - 1, centerY + 6 + pose.bodyOffsetY, 2, 6)
        ctx.strokeStyle = visuals.topSecondary
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(centerX - 9, centerY + 4 + pose.bodyOffsetY)
        ctx.lineTo(centerX - 3, centerY + 13 + pose.bodyOffsetY)
        ctx.moveTo(centerX + 9, centerY + 4 + pose.bodyOffsetY)
        ctx.lineTo(centerX + 3, centerY + 13 + pose.bodyOffsetY)
        ctx.stroke()
        break
      }
    }
  }

  private drawHair(
    ctx: CanvasRenderingContext2D,
    pose: FramePose,
    centerX: number,
    centerY: number,
    jobType: JobType,
    visuals: JobVisual
  ): void {
    const hairBaseY = centerY - 16 + pose.bodyOffsetY
    ctx.fillStyle = visuals.hairPrimary

    switch (jobType) {
      case 'developer':
        ctx.beginPath()
        ctx.arc(centerX, hairBaseY + 4, 9, Math.PI, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX - 5, hairBaseY + 5, 4, Math.PI, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX + 4, hairBaseY + 3, 4, Math.PI, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = visuals.hairSecondary
        ctx.fillRect(centerX - 6, hairBaseY + 8, 4, 2)
        ctx.fillRect(centerX + 2, hairBaseY + 7, 4, 2)
        break
      case 'sales':
        ctx.beginPath()
        ctx.roundRect(centerX - 8, hairBaseY + 4, 16, 6, 3)
        ctx.fill()
        ctx.fillStyle = visuals.hairSecondary
        ctx.fillRect(centerX - 6, hairBaseY + 6, 12, 2)
        break
      case 'marketing':
        ctx.beginPath()
        ctx.arc(centerX, hairBaseY + 5, 8, Math.PI, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = visuals.hairSecondary
        ctx.fillRect(centerX - 5, hairBaseY + 7, 10, 2)
        ctx.fillRect(centerX + 2, hairBaseY + 6, 3, 3)
        break
      case 'manager':
        ctx.beginPath()
        ctx.roundRect(centerX - 7, hairBaseY + 4, 14, 6, 2)
        ctx.fill()
        ctx.fillStyle = visuals.hairSecondary
        ctx.fillRect(centerX - 6, hairBaseY + 5, 12, 2)
        break
    }
  }

  private drawAccessory(
    ctx: CanvasRenderingContext2D,
    frame: number,
    pose: FramePose,
    centerX: number,
    centerY: number,
    jobType: JobType,
    visuals: JobVisual
  ): void {
    switch (jobType) {
      case 'developer': {
        if (frame < 4 && frame % 2 === 0) {
          ctx.strokeStyle = visuals.accessoryPrimary
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(centerX, centerY - 7 + pose.bodyOffsetY, 10, 0.65 * Math.PI, 0.35 * Math.PI, false)
          ctx.stroke()

          ctx.fillStyle = visuals.accessorySecondary
          ctx.fillRect(centerX - 6, centerY - 9 + pose.bodyOffsetY, 4, 2)
          ctx.fillRect(centerX + 2, centerY - 9 + pose.bodyOffsetY, 4, 2)
        } else {
          ctx.strokeStyle = visuals.accessoryPrimary
          ctx.lineWidth = 1.5
          ctx.strokeRect(centerX - 6, centerY - 11 + pose.bodyOffsetY, 5, 3)
          ctx.strokeRect(centerX + 2, centerY - 11 + pose.bodyOffsetY, 5, 3)
          ctx.beginPath()
          ctx.moveTo(centerX - 1, centerY - 10 + pose.bodyOffsetY)
          ctx.lineTo(centerX + 1, centerY - 10 + pose.bodyOffsetY)
          ctx.stroke()
        }
        break
      }
      case 'sales': {
        ctx.fillStyle = visuals.accessoryPrimary
        if (pose.isWorking) {
          ctx.fillRect(centerX + 11, centerY + 10 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 6, 6)
          ctx.fillStyle = visuals.accessorySecondary
          ctx.fillRect(centerX + 11, centerY + 12 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 6, 2)
        } else {
          ctx.fillRect(centerX + 11, centerY + 12 + pose.bodyOffsetY + pose.armOffsetY, 3, 6)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(centerX + 12, centerY + 13 + pose.bodyOffsetY + pose.armOffsetY, 1, 3)
        }
        break
      }
      case 'marketing': {
        ctx.fillStyle = visuals.accessorySecondary
        if (pose.isWorking) {
          ctx.fillRect(centerX + 6, centerY + pose.bodyOffsetY - 2, 10, 12)
          ctx.fillStyle = visuals.accessoryPrimary
          ctx.fillRect(centerX + 8, centerY + pose.bodyOffsetY + 1, 6, 2)
          ctx.fillRect(centerX + 8, centerY + pose.bodyOffsetY + 4, 6, 2)
        } else {
          ctx.fillRect(centerX - 18, centerY + pose.bodyOffsetY + 4, 12, 16)
          ctx.fillStyle = visuals.accessoryPrimary
          ctx.fillRect(centerX - 16, centerY + pose.bodyOffsetY + 6, 3, 12)
          ctx.fillRect(centerX - 12, centerY + pose.bodyOffsetY + 6, 3, 12)
        }
        break
      }
      case 'manager': {
        if (pose.isWorking) {
          ctx.fillStyle = '#f0f4f8'
          ctx.fillRect(centerX + 7, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 8, 10)
          ctx.strokeStyle = visuals.accessorySecondary
          ctx.lineWidth = 1
          ctx.strokeRect(centerX + 7, centerY + 6 + pose.bodyOffsetY + pose.armOffsetY + pose.armSwing, 8, 10)
        } else {
          ctx.fillStyle = visuals.accessoryPrimary
          ctx.fillRect(centerX - 11, centerY + 10 + pose.bodyOffsetY + pose.armOffsetY, 5, 2)
          ctx.fillStyle = '#4f5763'
          ctx.fillRect(centerX - 6, centerY + 10 + pose.bodyOffsetY + pose.armOffsetY, 2, 2)
        }
        break
      }
    }
  }

  private drawBadge(
    ctx: CanvasRenderingContext2D,
    frame: number,
    pose: FramePose,
    centerX: number,
    centerY: number,
    jobType: JobType,
    visuals: JobVisual
  ): void {
    const badgeX = centerX + 7
    const badgeY = centerY + 6 + pose.bodyOffsetY + (pose.isWorking ? -1 : 0)
    ctx.fillStyle = visuals.badgeSecondary
    ctx.fillRect(badgeX - 3, badgeY - 3, 6, 6)
    ctx.fillStyle = visuals.badgePrimary
    ctx.fillRect(badgeX - 2, badgeY - 2, 4, 4)

    ctx.fillStyle = '#ffffff'
    switch (jobType) {
      case 'developer':
        ctx.fillRect(badgeX - 2, badgeY - 1, 4, 2)
        ctx.fillRect(badgeX - 1, badgeY, 2, 1)
        break
      case 'sales':
        ctx.fillRect(badgeX - 1, badgeY - 2, 2, 4)
        ctx.fillRect(badgeX - 2, badgeY - 1, 1, 2)
        break
      case 'marketing':
        ctx.fillRect(badgeX - 2, badgeY + 1, 1, 1)
        ctx.fillRect(badgeX - 1, badgeY, 1, 2)
        ctx.fillRect(badgeX, badgeY - 1, 1, 3)
        ctx.fillRect(badgeX + 1, badgeY - 2, 1, 4)
        break
      case 'manager':
        ctx.fillRect(badgeX - 1, badgeY - 2, 2, 1)
        ctx.fillRect(badgeX - 1, badgeY - 1, 1, 3)
        ctx.fillRect(badgeX, badgeY - 1, 1, 3)
        break
    }
  }

  private composeAnimationKey(animationKeyBase: string, state: AnimationState): string {
    return `${animationKeyBase}-${state}`
  }

  private playLayerAnimation(
    sprite: Phaser.GameObjects.Sprite,
    animationKeyBase: string,
    state: AnimationState
  ): void {
    if (!animationKeyBase) {
      return
    }
    const key = this.composeAnimationKey(animationKeyBase, state)
    if (sprite.anims.currentAnim?.key === key) {
      return
    }
    sprite.play(key)
  }

  /**
   * Add a character container with layered sprites
   * T7: 合成テクスチャを使用してドローコールを削減
   */
  addCharacter(employeeId: string, x: number, y: number, jobType: JobType): Phaser.GameObjects.Container
  addCharacter(employeeId: string, x: number, y: number, jobType?: JobType): Phaser.GameObjects.Container {
    const resolvedJobType: JobType = jobType ?? 'developer'
    console.log(
      `[CharacterScene] Adding character ${employeeId} (${resolvedJobType}) at (${x}, ${y}) using composite texture`
    )

    const container = this.add.container(x, y)

    // T7: 合成テクスチャを使用（1つのスプライトで5レイヤー分）
    const compositeKey = this.compositeTextureCache.get(resolvedJobType)
    if (compositeKey) {
      const compositeSprite = this.make.sprite({ key: compositeKey, add: false })
      container.add(compositeSprite)
      container.setData('compositeSprite', compositeSprite)
    } else {
      // フォールバック: 従来の5レイヤー方式
      const baseSprite = this.make.sprite({ key: this.baseTextureKey, add: false })
      const bottomSprite = this.make.sprite({
        key: this.layerTextureCache[resolvedJobType].clothing_bottom,
        add: false
      })
      const topSprite = this.make.sprite({
        key: this.layerTextureCache[resolvedJobType].clothing_top,
        add: false
      })
      const accessorySprite = this.make.sprite({
        key: this.layerTextureCache[resolvedJobType].accessory,
        add: false
      })
      const badgeSprite = this.make.sprite({
        key: this.layerTextureCache[resolvedJobType].badge,
        add: false
      })

      container.add([
        baseSprite,
        bottomSprite,
        topSprite,
        accessorySprite,
        badgeSprite
      ])

      const layers: CharacterLayerSprites = {
        base: baseSprite,
        clothing_bottom: bottomSprite,
        clothing_top: topSprite,
        accessory: accessorySprite,
        badge: badgeSprite
      }
      container.setData('layers', layers)
    }

    container.setData('employeeId', employeeId)
    container.setData('jobType', resolvedJobType)
    container.setData('useComposite', !!compositeKey)

    // 初期深度を設定（Y座標ベース）
    container.setDepth(y)

    this.characterSprites.set(employeeId, container)
    this.setAnimation(employeeId, 'idle')

    // Add to movement manager for automatic walking
    if (this.movementManager) {
      this.movementManager.addCharacter(employeeId, container)
    }

    return container
  }

  /**
   * Update character animation state for all layers
   * T7: 合成テクスチャ対応
   */
  setAnimation(employeeId: string, state: AnimationState): void {
    const container = this.characterSprites.get(employeeId)
    if (!container) {
      console.warn(`[CharacterScene] Container not found for employee ${employeeId}`)
      return
    }

    const jobType = container.getData('jobType') as JobType
    const useComposite = container.getData('useComposite') as boolean

    if (useComposite) {
      // T7: 合成テクスチャのアニメーション
      const compositeSprite = container.getData('compositeSprite') as Phaser.GameObjects.Sprite
      if (compositeSprite) {
        const animKey = this.composeAnimationKey(`character-composite-${jobType}`, state)
        if (compositeSprite.anims.currentAnim?.key !== animKey) {
          compositeSprite.play(animKey)
        }
      }
    } else {
      // 従来のレイヤー方式
      const layers = container.getData('layers') as CharacterLayerSprites
      const animationBases = this.layerAnimationKeyBases[jobType]

      this.playLayerAnimation(layers.base, animationBases.base, state)
      this.playLayerAnimation(layers.clothing_bottom, animationBases.clothing_bottom, state)
      this.playLayerAnimation(layers.clothing_top, animationBases.clothing_top, state)
      this.playLayerAnimation(layers.accessory, animationBases.accessory, state)
      this.playLayerAnimation(layers.badge, animationBases.badge, state)
    }
  }

  /**
   * Remove a character
   */
  removeCharacter(employeeId: string): void {
    const container = this.characterSprites.get(employeeId)
    if (container) {
      // Remove from movement manager
      if (this.movementManager) {
        this.movementManager.removeCharacter(employeeId)
      }

      // Remove any active effects
      if (this.effectManager) {
        this.effectManager.removeEffect(employeeId)
      }

      container.destroy()
      this.characterSprites.delete(employeeId)
      console.log(`[CharacterScene] Removed character ${employeeId}`)
    }
  }

  /**
   * Get all character containers
   */
  getAllCharacters(): Map<string, Phaser.GameObjects.Container> {
    return this.characterSprites
  }

  /**
   * Get a specific character container
   */
  getCharacter(employeeId: string): Phaser.GameObjects.Container | undefined {
    return this.characterSprites.get(employeeId)
  }

  /**
   * Clear all characters
   */
  clearAllCharacters(): void {
    this.characterSprites.forEach((container, id) => {
      this.removeCharacter(id)
    })
  }
}

// Helper functions for game integration
let phaserGameInstance: Phaser.Game | null = null

export function initCharacterRenderer(containerId: string): Phaser.Game {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`Container element '${containerId}' not found`)
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: containerId,
    backgroundColor: '#2d3748',
    scene: CharacterScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: true,
      antialias: false
    }
  }

  phaserGameInstance = new Phaser.Game(config)
  return phaserGameInstance
}

export function getCharacterScene(game: Phaser.Game): CharacterScene | null {
  const scene = game.scene.getScene('CharacterScene')
  return scene as CharacterScene | null
}
