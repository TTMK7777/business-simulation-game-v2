/**
 * characterRoutine.ts のユニットテスト（Phase 1 見える化スプリント D: キャラクター日課 v1）
 *
 * テスト対象:
 * - 職種絵文字/バッジの重複がないこと（旧実装は sales/manager が同一絵文字だった回帰テスト）
 * - 座席割当（allocateSeat）: 空きインデックスの最小値埋め、重複なし
 * - デスク位置（getDeskPosition）: 比率の範囲内保証、職種別の行分離、座席別の列分離
 * - 休憩ステートマシン（advanceRoutineTick）: 状態遷移、状態別の休憩確率順序、強制休憩ルール
 */

import { describe, it, expect } from 'vitest'
import {
  JOB_EMOJIS,
  JOB_BADGES,
  JOB_ORDER,
  allocateSeat,
  getDeskPosition,
  createInitialRoutineState,
  advanceRoutineTick,
  getBreakChance,
  type JobType,
} from '../lib/characterRoutine'

describe('JOB_EMOJIS / JOB_BADGES', () => {
  it('4職種すべてに絵文字が定義されている', () => {
    JOB_ORDER.forEach((job) => {
      expect(JOB_EMOJIS[job]).toBeTruthy()
      expect(JOB_BADGES[job]).toBeTruthy()
    })
  })

  it('職種間で基本絵文字が重複しない（sales/manager重複バグの回帰テスト）', () => {
    const emojis = JOB_ORDER.map((job) => JOB_EMOJIS[job])
    const uniqueEmojis = new Set(emojis)
    expect(uniqueEmojis.size).toBe(JOB_ORDER.length)
  })

  it('職種間でバッジも重複しない', () => {
    const badges = JOB_ORDER.map((job) => JOB_BADGES[job])
    const uniqueBadges = new Set(badges)
    expect(uniqueBadges.size).toBe(JOB_ORDER.length)
  })
})

describe('allocateSeat', () => {
  it('空プールでは0を返す', () => {
    expect(allocateSeat(new Set())).toBe(0)
  })

  it('占有済みの座席を避けて最小の空きインデックスを返す', () => {
    expect(allocateSeat(new Set([0, 1, 2]))).toBe(3)
  })

  it('中間の座席が解放されていればそこを優先して埋める（ギャップ埋め）', () => {
    const occupied = new Set([0, 2, 3])
    expect(allocateSeat(occupied)).toBe(1)
  })

  it('連続して割り当てても重複しない', () => {
    const occupied = new Set<number>()
    const seats = new Set<number>()
    for (let i = 0; i < 10; i++) {
      const seat = allocateSeat(occupied)
      expect(seats.has(seat)).toBe(false)
      seats.add(seat)
      occupied.add(seat)
    }
    expect(seats.size).toBe(10)
  })
})

describe('getDeskPosition', () => {
  it('xRatioは常に[0,1]の範囲内に収まる', () => {
    JOB_ORDER.forEach((job) => {
      for (let seatIndex = 0; seatIndex < 40; seatIndex++) {
        const { xRatio } = getDeskPosition(job, seatIndex)
        expect(xRatio).toBeGreaterThanOrEqual(0)
        expect(xRatio).toBeLessThanOrEqual(1)
      }
    })
  })

  it('職種ごとに異なる行(bottomPx)を持つ（座席0同士で比較）', () => {
    const bottoms = JOB_ORDER.map((job) => getDeskPosition(job, 0).bottomPx)
    const uniqueBottoms = new Set(bottoms)
    expect(uniqueBottoms.size).toBe(JOB_ORDER.length)
  })

  it('同一職種内では座席インデックスが異なればxRatioも異なる（1行に収まる範囲内）', () => {
    const job: JobType = 'developer'
    const positions = [0, 1, 2, 3].map((seatIndex) => getDeskPosition(job, seatIndex).xRatio)
    const uniqueRatios = new Set(positions)
    expect(uniqueRatios.size).toBe(4)
  })

  it('未知の職種文字列が渡っても例外を投げず先頭行にフォールバックする', () => {
    expect(() => getDeskPosition('unknown' as JobType, 0)).not.toThrow()
  })
})

describe('createInitialRoutineState', () => {
  it('初期状態はat_desk・ticksAtDesk=0', () => {
    expect(createInitialRoutineState()).toEqual({ phase: 'at_desk', ticksAtDesk: 0 })
  })
})

describe('advanceRoutineTick', () => {
  it('休憩中(on_break)は次のtickで必ずat_deskへ戻る（rngの値に関わらず）', () => {
    const onBreak = { phase: 'on_break' as const, ticksAtDesk: 2 }
    const next = advanceRoutineTick(onBreak, 'idle', () => 0) // rng=0でも
    expect(next.phase).toBe('at_desk')
    expect(next.ticksAtDesk).toBe(0)
  })

  it('rngが常に閾値未満なら休憩確率に応じてon_breakへ遷移する', () => {
    const atDesk = createInitialRoutineState()
    const next = advanceRoutineTick(atDesk, 'stressed', () => 0)
    expect(next.phase).toBe('on_break')
  })

  it('rngが常に1未満の最大値付近ならforce-break閾値に達するまでat_deskを維持する', () => {
    const atDesk = createInitialRoutineState()
    const next = advanceRoutineTick(atDesk, 'idle', () => 0.99)
    expect(next.phase).toBe('at_desk')
    expect(next.ticksAtDesk).toBe(1)
  })

  it('休憩確率はidle < working < stressedの順（境界値rngで検証）', () => {
    const atDesk = createInitialRoutineState()

    // idleの閾値(0.05)以上・workingの閾値(0.15)未満のrng値
    const rngBetweenIdleAndWorking = () => 0.10
    expect(advanceRoutineTick(atDesk, 'idle', rngBetweenIdleAndWorking).phase).toBe('at_desk')
    expect(advanceRoutineTick(atDesk, 'working', rngBetweenIdleAndWorking).phase).toBe('on_break')

    // workingの閾値(0.15)以上・stressedの閾値(0.35)未満のrng値
    const rngBetweenWorkingAndStressed = () => 0.20
    expect(advanceRoutineTick(atDesk, 'working', rngBetweenWorkingAndStressed).phase).toBe('at_desk')
    expect(advanceRoutineTick(atDesk, 'stressed', rngBetweenWorkingAndStressed).phase).toBe('on_break')
  })

  it('getBreakChanceの値がidle<working<stressedの単調増加になっている', () => {
    expect(getBreakChance('idle')).toBeLessThan(getBreakChance('working'))
    expect(getBreakChance('working')).toBeLessThan(getBreakChance('stressed'))
  })

  it('休憩なしでticksAtDeskが一定回数に達すると、rngの結果に関わらず強制的に休憩する', () => {
    let state = createInitialRoutineState()
    const neverRandomlyBreak = () => 0.999
    let forcedBreakOccurred = false

    for (let i = 0; i < 10; i++) {
      state = advanceRoutineTick(state, 'idle', neverRandomlyBreak)
      if (state.phase === 'on_break') {
        forcedBreakOccurred = true
        break
      }
    }

    expect(forcedBreakOccurred).toBe(true)
  })
})
