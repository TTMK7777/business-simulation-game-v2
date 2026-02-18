// CSS-based Character Animation Manager
// Lightweight alternative to Phaser

export type AnimationState = 'idle' | 'working' | 'stressed'
export type JobType = 'developer' | 'sales' | 'marketing' | 'manager'
export type EffectType = 'levelUp' | 'money' | 'happy' | 'sad' | 'sparkle'

interface Character {
  id: string
  element: HTMLElement
  jobType: JobType
  state: AnimationState
  x: number
  y: number
  clickHandler?: () => void
}

const JOB_EMOJIS: Record<JobType, string> = {
  developer: '🧑‍💻',
  sales: '🧑‍💼',
  marketing: '🧑‍🎨',
  manager: '🧑‍💼'
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

    // Remove existing character with same ID
    if (this.characters.has(employeeId)) {
      this.removeCharacter(employeeId)
    }

    // Random position within office
    const x = 50 + Math.random() * (this.container.clientWidth - 100)
    const y = 80 + Math.random() * 150

    const element = document.createElement('div')
    element.className = 'character idle'
    element.dataset.job = jobType
    element.dataset.employeeId = employeeId
    element.style.left = `${x}px`
    element.style.bottom = `${y}px`

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

    this.characters.set(employeeId, {
      id: employeeId,
      element,
      jobType,
      state: 'idle',
      x,
      y,
      clickHandler: onClick
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
  }

  removeCharacter(employeeId: string): void {
    const character = this.characters.get(employeeId)
    if (character) {
      // Clean up event listener to prevent memory leak
      if (character.clickHandler) {
        character.element.removeEventListener('click', character.clickHandler)
      }
      character.element.remove()
      this.characters.delete(employeeId)
    }
  }

  clearAllCharacters(): void {
    this.characters.forEach((character) => {
      if (character.clickHandler) {
        character.element.removeEventListener('click', character.clickHandler)
      }
      character.element.remove()
    })
    this.characters.clear()
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
