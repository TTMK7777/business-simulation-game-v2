import Phaser from 'phaser'
import type { CharacterScene, AnimationState } from './CharacterRenderer'

/**
 * キャラクター移動管理システム
 * キャラクターの自動移動、パトロール、ランダム歩行を管理
 */

export interface MovementConfig {
  /** 移動速度（ピクセル/秒） */
  speed: number
  /** 待機時間（ミリ秒） */
  idleDuration: number
  /** 移動開始確率（0-1） */
  moveChance: number
  /** 移動範囲の境界 */
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface PatrolPoint {
  x: number
  y: number
  waitTime?: number
}

/**
 * キャラクターの移動状態
 */
class CharacterMovementState {
  public isMoving: boolean = false
  public currentPath: PatrolPoint[] = []
  public currentPathIndex: number = 0
  public idleTimer: number = 0
  public nextMoveTime: number = 0
  // T9: 前回のY座標を記録
  public lastY: number = 0

  constructor(
    public employeeId: string,
    public container: Phaser.GameObjects.Container,
    public config: MovementConfig
  ) {
    // T9: 初期Y座標を記録
    this.lastY = container.y
  }
}

/**
 * キャラクター移動マネージャー
 */
export class CharacterMovementManager {
  private movementStates: Map<string, CharacterMovementState> = new Map()
  private scene: CharacterScene
  private defaultConfig: MovementConfig = {
    speed: 100, // 100px/秒
    idleDuration: 3000, // 3秒待機
    moveChance: 0.3, // 30%の確率で移動
    bounds: {
      x: 50,
      y: 50,
      width: 700,
      height: 500
    }
  }

  constructor(scene: CharacterScene, config?: Partial<MovementConfig>) {
    this.scene = scene
    if (config) {
      this.defaultConfig = { ...this.defaultConfig, ...config }
    }
  }

  /**
   * キャラクターを移動管理に追加
   */
  addCharacter(employeeId: string, container: Phaser.GameObjects.Container, config?: Partial<MovementConfig>): void {
    const finalConfig = config ? { ...this.defaultConfig, ...config } : this.defaultConfig
    const state = new CharacterMovementState(employeeId, container, finalConfig)
    state.nextMoveTime = this.scene.time.now + Phaser.Math.Between(1000, 3000)
    this.movementStates.set(employeeId, state)
    console.log(`[CharacterMovement] Added ${employeeId} to movement system`)
  }

  /**
   * キャラクターを移動管理から削除
   */
  removeCharacter(employeeId: string): void {
    const state = this.movementStates.get(employeeId)
    if (state) {
      // Tweenが動作中の場合は停止
      this.scene.tweens.killTweensOf(state.container)
      this.movementStates.delete(employeeId)
      console.log(`[CharacterMovement] Removed ${employeeId} from movement system`)
    }
  }

  /**
   * すべてのキャラクターをクリア
   */
  clearAll(): void {
    this.movementStates.forEach((state) => {
      this.scene.tweens.killTweensOf(state.container)
    })
    this.movementStates.clear()
    console.log('[CharacterMovement] Cleared all characters')
  }

  /**
   * キャラクターをパトロールさせる
   */
  setPatrolPath(employeeId: string, path: PatrolPoint[], loop: boolean = true): void {
    const state = this.movementStates.get(employeeId)
    if (!state) {
      console.warn(`[CharacterMovement] Employee ${employeeId} not found`)
      return
    }

    state.currentPath = path
    state.currentPathIndex = 0
    this.moveToNextPatrolPoint(state, loop)
  }

  /**
   * ランダムな位置に移動
   */
  moveToRandomPosition(employeeId: string): void {
    const state = this.movementStates.get(employeeId)
    if (!state || state.isMoving) return

    const { bounds } = state.config
    const targetX = Phaser.Math.Between(bounds.x, bounds.x + bounds.width)
    const targetY = Phaser.Math.Between(bounds.y, bounds.y + bounds.height)

    this.moveToPosition(employeeId, targetX, targetY)
  }

  /**
   * 指定座標に移動
   * T9: setDepth最適化 - Y座標変化時のみ更新
   */
  moveToPosition(employeeId: string, targetX: number, targetY: number, onComplete?: () => void): void {
    const state = this.movementStates.get(employeeId)
    if (!state) return

    const currentX = state.container.x
    const currentY = state.container.y
    const distance = Phaser.Math.Distance.Between(currentX, currentY, targetX, targetY)
    const duration = (distance / state.config.speed) * 1000

    state.isMoving = true

    // アニメーションを 'working' に設定（歩行中）
    this.scene.setAnimation(employeeId, 'working')

    this.scene.tweens.add({
      targets: state.container,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // T9: Y座標が変化した時のみsetDepthを呼び出す
        const currentY = Math.round(state.container.y)
        if (currentY !== state.lastY) {
          state.container.setDepth(currentY)
          state.lastY = currentY
        }
      },
      onComplete: () => {
        state.isMoving = false
        state.idleTimer = 0
        state.nextMoveTime = this.scene.time.now + state.config.idleDuration

        // 待機アニメーションに戻す
        this.scene.setAnimation(employeeId, 'idle')

        if (onComplete) {
          onComplete()
        }
      }
    })
  }

  /**
   * パトロールポイントの次の地点に移動
   */
  private moveToNextPatrolPoint(state: CharacterMovementState, loop: boolean): void {
    if (state.currentPath.length === 0) return

    const point = state.currentPath[state.currentPathIndex]
    const waitTime = point.waitTime || state.config.idleDuration

    this.moveToPosition(state.employeeId, point.x, point.y, () => {
      // 待機時間を設定
      this.scene.time.delayedCall(waitTime, () => {
        state.currentPathIndex++

        if (state.currentPathIndex >= state.currentPath.length) {
          if (loop) {
            state.currentPathIndex = 0
            this.moveToNextPatrolPoint(state, loop)
          } else {
            state.currentPath = []
          }
        } else {
          this.moveToNextPatrolPoint(state, loop)
        }
      })
    })
  }

  /**
   * 毎フレーム更新（Phaser Sceneのupdateから呼び出す）
   */
  update(time: number, delta: number): void {
    this.movementStates.forEach((state) => {
      // パトロール中またはすでに移動中の場合はスキップ
      if (state.isMoving || state.currentPath.length > 0) return

      // 次の移動時刻に達したかチェック
      if (time >= state.nextMoveTime) {
        // 確率判定で移動するかどうか決定
        if (Math.random() < state.config.moveChance) {
          this.moveToRandomPosition(state.employeeId)
        } else {
          // 移動しない場合は次の判定時刻を設定
          state.nextMoveTime = time + Phaser.Math.Between(2000, 5000)
        }
      }
    })
  }

  /**
   * 特定の範囲内でランダムパトロール開始
   */
  startRandomPatrol(employeeId: string, pointCount: number = 3): void {
    const state = this.movementStates.get(employeeId)
    if (!state) return

    const { bounds } = state.config
    const path: PatrolPoint[] = []

    for (let i = 0; i < pointCount; i++) {
      path.push({
        x: Phaser.Math.Between(bounds.x, bounds.x + bounds.width),
        y: Phaser.Math.Between(bounds.y, bounds.y + bounds.height),
        waitTime: Phaser.Math.Between(2000, 5000)
      })
    }

    this.setPatrolPath(employeeId, path, true)
  }

  /**
   * すべてのキャラクターを一時停止
   */
  pauseAll(): void {
    this.movementStates.forEach((state) => {
      this.scene.tweens.killTweensOf(state.container)
      state.isMoving = false
      this.scene.setAnimation(state.employeeId, 'idle')
    })
  }

  /**
   * すべてのキャラクターの移動を再開
   */
  resumeAll(): void {
    this.movementStates.forEach((state) => {
      if (!state.isMoving && state.currentPath.length === 0) {
        state.nextMoveTime = this.scene.time.now + Phaser.Math.Between(1000, 3000)
      }
    })
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo(): string {
    const states = Array.from(this.movementStates.values())
    const movingCount = states.filter((s) => s.isMoving).length
    const patrollingCount = states.filter((s) => s.currentPath.length > 0).length

    return `Characters: ${states.length} | Moving: ${movingCount} | Patrolling: ${patrollingCount}`
  }
}
