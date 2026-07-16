// キャラクター日課システム — DOM非依存の純粋ロジック層
// 座席割当・デスク位置計算・休憩ステートマシンを分離し、ユニットテスト可能にする。
// DOM操作は行わない（cssCharacterManager.ts が本モジュールの計算結果を元にDOMへ反映する）。

export type JobType = 'developer' | 'sales' | 'marketing' | 'manager'
export type AnimationState = 'idle' | 'working' | 'stressed'
export type RoutinePhase = 'at_desk' | 'on_break'

// 職種別の基本絵文字（旧実装は sales/manager が同一絵文字で重複していた）
export const JOB_EMOJIS: Record<JobType, string> = {
  developer: '🧑‍💻',
  sales: '🧑‍💼',
  marketing: '🧑‍🎨',
  manager: '🫅'
}

// 職種バッジ（キャラクター右下に表示する小アイコン）
export const JOB_BADGES: Record<JobType, string> = {
  developer: '💻',
  sales: '📞',
  marketing: '📊',
  manager: '👔'
}

export const JOB_ORDER: JobType[] = ['developer', 'sales', 'marketing', 'manager']

// ============================================
// 座席割当（空いている最小インデックスを埋める）
// ============================================

export function allocateSeat(occupied: ReadonlySet<number>): number {
  let i = 0
  while (occupied.has(i)) {
    i++
  }
  return i
}

// ============================================
// デスク位置（コンテナ幅に対する比率で返す。px換算はDOM層が担当）
// ============================================

export interface DeskPosition {
  xRatio: number // 0-1、コンテナ幅に対する比率
  bottomPx: number // フロアからの高さ(px)
}

const ROW_BOTTOM_MIN = 85
const ROW_BOTTOM_MAX = 225
const SEAT_X_MIN = 0.06
const SEAT_X_MAX = 0.94
const SEAT_SPACING_RATIO = 0.12
const SEATS_PER_ROW = Math.floor((SEAT_X_MAX - SEAT_X_MIN) / SEAT_SPACING_RATIO) + 1
const ROW_WRAP_OFFSET_PX = 14
const MAX_WRAP_OFFSET_STEPS = 3

export function getDeskPosition(jobType: JobType, seatIndex: number): DeskPosition {
  const rowIndex = Math.max(0, JOB_ORDER.indexOf(jobType))
  const rowCount = JOB_ORDER.length
  const baseBottom =
    rowCount > 1
      ? ROW_BOTTOM_MIN + (rowIndex / (rowCount - 1)) * (ROW_BOTTOM_MAX - ROW_BOTTOM_MIN)
      : (ROW_BOTTOM_MIN + ROW_BOTTOM_MAX) / 2

  const safeSeatIndex = Math.max(0, seatIndex)
  const col = safeSeatIndex % SEATS_PER_ROW
  const wrapCount = Math.floor(safeSeatIndex / SEATS_PER_ROW)
  const wrapSign = wrapCount % 2 === 0 ? 1 : -1
  const wrapOffset = wrapSign * Math.min(wrapCount, MAX_WRAP_OFFSET_STEPS) * ROW_WRAP_OFFSET_PX

  const xRatio = Math.min(SEAT_X_MAX, SEAT_X_MIN + col * SEAT_SPACING_RATIO)
  const bottomPx = baseBottom + wrapOffset

  return { xRatio, bottomPx }
}

// オフィス入口（画面外左）の位置比率。addCharacter/removeCharacter の歩行演出に使う
export const ENTRANCE_X_RATIO = -0.08

// 休憩コーナーの固定位置
export const BREAK_CORNER: DeskPosition = { xRatio: 0.5, bottomPx: 40 }
export const BREAK_EMOJI = '☕'

// ============================================
// 休憩ステートマシン（軽量。出勤/退勤はDOM層が一度きりの遷移として扱う）
// ============================================

export interface RoutineState {
  phase: RoutinePhase
  ticksAtDesk: number
}

export function createInitialRoutineState(): RoutineState {
  return { phase: 'at_desk', ticksAtDesk: 0 }
}

// 状態ごとの休憩確率（ストレス高 > 稼働中 > 待機中の順）
const BREAK_CHANCE: Record<AnimationState, number> = {
  idle: 0.05,
  working: 0.15,
  stressed: 0.35
}

export function getBreakChance(state: AnimationState): number {
  return BREAK_CHANCE[state]
}

// 連続稼働ターン数がこれ以上になったら確率に関わらず休憩を強制する
const FORCE_BREAK_AFTER_TICKS = 5

export function advanceRoutineTick(
  current: RoutineState,
  animState: AnimationState,
  rng: () => number = Math.random
): RoutineState {
  if (current.phase === 'on_break') {
    // 休憩は必ず1tickで終了しデスクへ戻る
    return { phase: 'at_desk', ticksAtDesk: 0 }
  }

  const forceBreak = current.ticksAtDesk >= FORCE_BREAK_AFTER_TICKS
  const chance = getBreakChance(animState)

  if (forceBreak || rng() < chance) {
    return { phase: 'on_break', ticksAtDesk: current.ticksAtDesk }
  }

  return { phase: 'at_desk', ticksAtDesk: current.ticksAtDesk + 1 }
}
