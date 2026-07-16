// CSS-based Character Animation Manager
// Lightweight alternative to Phaser
//
// v1 日課システム: 出勤（歩いて入場）→ デスクで稼働/休憩 → 退勤（歩いて退場）
// 状態機械・座席割当・デスク位置計算は characterRoutine.ts（DOM非依存）に分離。
// このファイルはその計算結果をDOMへ反映する層のみを担当する。

import {
  JOB_EMOJIS,
  JOB_BADGES,
  ENTRANCE_X_RATIO,
  BREAK_CORNER,
  BREAK_EMOJI,
  allocateSeat,
  getDeskPosition,
  createInitialRoutineState,
  advanceRoutineTick,
  type JobType,
  type AnimationState,
  type DeskPosition,
  type RoutineState
} from './characterRoutine'

export type { AnimationState, JobType }
export type EffectType = 'levelUp' | 'money' | 'happy' | 'sad' | 'sparkle'

interface Character {
  id: string
  element: HTMLElement
  deskElement: HTMLElement
  jobType: JobType
  state: AnimationState
  x: number
  y: number
  clickHandler?: () => void
  seatIndex: number
  deskPosition: DeskPosition
  routineState: RoutineState
}

const EFFECT_EMOJIS: Record<EffectType, string> = {
  levelUp: '⬆️',
  money: '💰',
  happy: '😊',
  sad: '😢',
  sparkle: '✨'
}

class CSSCharacterManager {
  private container: HTMLElement | null = null
  private characters: Map<string, Character> = new Map()
  private occupiedSeats: Set<number> = new Set()
  private isInitialized = false

  init(containerId: string): void {
    const existing = document.getElementById(containerId)
    if (!existing) {
      console.warn(`Container #${containerId} not found`)
      return
    }

    existing.innerHTML = `
      <div class="office-characters">
        <div class="office-floor"></div>
        <div class="office-plant" style="left: 10px; bottom: 70px;">🌿</div>
        <div class="office-plant" style="right: 10px; bottom: 70px;">🪴</div>
      </div>
    `
    this.container = existing.querySelector('.office-characters')
    this.isInitialized = true
  }

  addCharacter(
    employeeId: string,
    name: string,
    jobType: JobType,
    onClick?: () => void
  ): void {
    if (!this.container || !this.isInitialized) return

    // Remove existing character with same ID (instant, no exit animation —
    // this is an internal replace, not a real employee departure)
    if (this.characters.has(employeeId)) {
      this.hardRemoveCharacter(employeeId)
    }

    const seatIndex = allocateSeat(this.occupiedSeats)
    this.occupiedSeats.add(seatIndex)
    const deskPosition = getDeskPosition(jobType, seatIndex)

    const containerWidth = this.container.clientWidth
    const deskLeftPx = deskPosition.xRatio * containerWidth
    const entranceLeftPx = ENTRANCE_X_RATIO * containerWidth

    // デスクの装飾要素（キャラクターより先にappendして背面に表示）
    const deskElement = document.createElement('div')
    deskElement.className = 'office-desk'
    deskElement.dataset.job = jobType
    deskElement.style.left = `${deskLeftPx - 5}px`
    deskElement.style.bottom = `${Math.max(0, deskPosition.bottomPx - 20)}px`
    this.container.appendChild(deskElement)

    const element = document.createElement('div')
    element.className = 'character idle'
    element.dataset.job = jobType
    element.dataset.employeeId = employeeId
    element.style.left = `${entranceLeftPx}px`
    element.style.bottom = `${deskPosition.bottomPx}px`

    // Safe DOM construction (XSS prevention)
    const emojiDiv = document.createElement('div')
    emojiDiv.className = 'character-emoji'
    emojiDiv.textContent = JOB_EMOJIS[jobType]

    const nameDiv = document.createElement('div')
    nameDiv.className = 'character-name'
    nameDiv.textContent = name

    element.appendChild(emojiDiv)
    element.appendChild(nameDiv)

    if (onClick) {
      element.addEventListener('click', onClick)
    }

    this.container.appendChild(element)

    // entrance位置を一度描画確定させてから desk位置へ変更することで
    // 「歩いて入場」の transition を確実に発火させる（reflow強制）
    void element.offsetWidth
    element.style.left = `${deskLeftPx}px`

    this.characters.set(employeeId, {
      id: employeeId,
      element,
      deskElement,
      jobType,
      state: 'idle',
      x: deskLeftPx,
      y: deskPosition.bottomPx,
      clickHandler: onClick,
      seatIndex,
      deskPosition,
      routineState: createInitialRoutineState()
    })
  }

  setAnimation(employeeId: string, state: AnimationState): void {
    const character = this.characters.get(employeeId)
    if (!character) return

    character.element.classList.remove('idle', 'working', 'stressed')
    character.element.classList.add(state)
    character.state = state

    // Add/update status indicator
    let statusEl = character.element.querySelector('.character-status') as HTMLElement
    if (!statusEl) {
      statusEl = document.createElement('div')
      statusEl.className = 'character-status'
      character.element.appendChild(statusEl)
    }

    switch (state) {
      case 'working':
        statusEl.textContent = '⚡'
        break
      case 'stressed':
        statusEl.textContent = '😰'
        break
      default:
        statusEl.textContent = ''
    }

    // 日課ステートマシンを1tick進める（呼び出し頻度 = ターン送り頻度に一致するため
    // GameManager 側の追加フックは不要。休憩中は desk 位置ではなく休憩コーナーへ移動する）
    character.routineState = advanceRoutineTick(character.routineState, state)

    const containerWidth = this.container?.clientWidth ?? 0
    if (character.routineState.phase === 'on_break') {
      character.element.classList.add('on-break')
      character.element.style.left = `${BREAK_CORNER.xRatio * containerWidth}px`
      character.element.style.bottom = `${BREAK_CORNER.bottomPx}px`
      statusEl.textContent = BREAK_EMOJI
    } else {
      character.element.classList.remove('on-break')
      character.element.style.left = `${character.deskPosition.xRatio * containerWidth}px`
      character.element.style.bottom = `${character.deskPosition.bottomPx}px`
    }
  }

  removeCharacter(employeeId: string): void {
    const character = this.characters.get(employeeId)
    if (!character) return

    // Clean up event listener to prevent memory leak
    if (character.clickHandler) {
      character.element.removeEventListener('click', character.clickHandler)
    }
    this.occupiedSeats.delete(character.seatIndex)
    this.characters.delete(employeeId)

    // 残留アニメーション中の要素と新規追加キャラのID衝突を避ける
    delete character.element.dataset.employeeId

    // 退勤（歩いて退場）してからDOMを除去
    const containerWidth = this.container?.clientWidth ?? 0
    character.element.style.left = `${ENTRANCE_X_RATIO * containerWidth}px`

    const cleanup = () => {
      character.element.remove()
      character.deskElement.remove()
    }
    character.element.addEventListener('transitionend', cleanup, { once: true })
    // Fallback timeout in case transition doesn't fire
    setTimeout(cleanup, 900)
  }

  // addCharacter の重複除去専用。退勤アニメーションを伴わない即時削除。
  private hardRemoveCharacter(employeeId: string): void {
    const character = this.characters.get(employeeId)
    if (character) {
      if (character.clickHandler) {
        character.element.removeEventListener('click', character.clickHandler)
      }
      this.occupiedSeats.delete(character.seatIndex)
      character.element.remove()
      character.deskElement.remove()
      this.characters.delete(employeeId)
    }
  }

  clearAllCharacters(): void {
    this.characters.forEach((character) => {
      if (character.clickHandler) {
        character.element.removeEventListener('click', character.clickHandler)
      }
      character.element.remove()
      character.deskElement.remove()
    })
    this.characters.clear()
    this.occupiedSeats.clear()
  }

  getCharacter(employeeId: string): Character | undefined {
    return this.characters.get(employeeId)
  }

  getAllCharacters(): Map<string, Character> {
    return this.characters
  }

  playEffect(employeeId: string, effectType: EffectType): void {
    const character = this.characters.get(employeeId)
    if (!character) return

    const effect = document.createElement('div')
    effect.className = 'character-effect'
    effect.textContent = EFFECT_EMOJIS[effectType] || EFFECT_EMOJIS.sparkle

    character.element.appendChild(effect)

    // Use animation end event instead of setTimeout for better reliability
    effect.addEventListener('animationend', () => effect.remove(), { once: true })
    // Fallback timeout in case animation doesn't fire
    setTimeout(() => effect.remove(), 1100)
  }

  destroy(): void {
    this.clearAllCharacters()
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.container = null
    this.isInitialized = false
  }
}

// Singleton instance
export const characterManager = new CSSCharacterManager()

// Helper functions for compatibility with existing code
export function initCharacterRenderer(containerId: string): void {
  characterManager.init(containerId)
}

export function getCharacterManager(): CSSCharacterManager {
  return characterManager
}

// JOB_BADGES は main.css 側の ::after バッジと対応（テスト・将来のJS側描画用に再エクスポート）
export { JOB_BADGES }
