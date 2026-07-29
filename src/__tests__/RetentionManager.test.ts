/**
 * RetentionManager.ts のユニットテスト（Wave 1-B: 退職・モチベーションの実効化）
 *
 * テスト対象:
 * - calculateMotivationDelta(): 変動源（過重労働 / 回復 / 放置 / burnout_prone）の加算
 * - calculateResignChance(): employeeResignChance のモチベーション連動
 *   （安全圏は 0 / 低モチベほど高い / burnout_prone・inconsistent で上乗せ / 上限クランプ）
 * - rollPerformanceMultiplier(): inconsistent 判明済みのみ 0.2〜1.2 で変動、他は常に 1
 * - calculateWorkforceMultiplier(): 平均実効モチベーションの売上係数（基準点で 1.0）
 * - processMonthlyRetention(): 退職の実行・1ヶ月1名まで・最低1名は残す・再採用コスト算出
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateMotivationDelta,
  calculateResignChance,
  rollPerformanceMultiplier,
  calculateWorkforceMultiplier,
  processMonthlyRetention,
} from '../lib/managers/RetentionManager'
import { getGame, resetGameState } from '../lib/store/gameStore'
import { BALANCE_CONFIG } from '../lib/gameConfig'
import type { Employee } from '../lib/types/index'

beforeEach(() => {
  resetGameState()
})

const R = BALANCE_CONFIG.retention

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    name: 'テスト 太郎',
    age: 30,
    personalityKey: 'logical',
    abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
    temperament: {
      boldness: 50,
      bravery: 50,
      cooperation: 50,
      creativity: 50,
      conscientiousness: 50,
      emotionalStability: 50,
      sociability: 50,
      cautiousness: 50,
    },
    subTraits: [],
    hiddenTrait: 'none',
    hiddenTraitRevealed: false,
    joinedTurn: 1,
    motivation: 70,
    salary: 300_000,
    department: 'development',
    position: 'staff',
    qualification: null,
    skillPoints: 0,
    unlockedSkills: [],
    growthHistory: [],
    stress: 0,
    lastTrainingTurn: 1,
    ...overrides,
  }
}

// ============================================================
// calculateMotivationDelta
// ============================================================
describe('calculateMotivationDelta', () => {
  it('ストレスが低く研修も直近なら回復ぶんだけプラスになる', () => {
    const emp = makeEmployee({ stress: 10, lastTrainingTurn: 5 })
    const result = calculateMotivationDelta(emp, 6)

    expect(result.delta).toBe(R.lowStressRecovery)
    expect(result.reasons).toContain('休息')
  })

  it('高ストレスは過重労働ペナルティを受ける', () => {
    const emp = makeEmployee({ stress: 80, lastTrainingTurn: 5 })
    const result = calculateMotivationDelta(emp, 6)

    expect(result.delta).toBe(-R.highStressPenalty)
    expect(result.reasons).toContain('過重労働')
  })

  it('中ストレスは軽いペナルティにとどまる', () => {
    const emp = makeEmployee({ stress: 55, lastTrainingTurn: 5 })
    const result = calculateMotivationDelta(emp, 6)

    expect(result.delta).toBe(-R.midStressPenalty)
  })

  it('研修から neglectTurns 以上あくと放置ペナルティが加算される', () => {
    const emp = makeEmployee({ stress: 80, lastTrainingTurn: 1 })
    const result = calculateMotivationDelta(emp, 1 + R.neglectTurns)

    expect(result.delta).toBe(-(R.highStressPenalty + R.neglectPenalty))
    expect(result.reasons).toContain('放置')
  })

  it('lastTrainingTurn 未設定の従業員は joinedTurn を起点に放置を判定する', () => {
    const emp = makeEmployee({ stress: 30, lastTrainingTurn: undefined, joinedTurn: 2 })
    const result = calculateMotivationDelta(emp, 2 + R.neglectTurns)

    expect(result.delta).toBe(-R.neglectPenalty)
  })

  it('burnout_prone が判明済みかつ高ストレスなら追加ペナルティを受ける', () => {
    const emp = makeEmployee({
      stress: 80,
      lastTrainingTurn: 5,
      hiddenTrait: 'burnout_prone',
      hiddenTraitRevealed: true,
    })
    const result = calculateMotivationDelta(emp, 6)

    expect(result.delta).toBe(-(R.highStressPenalty + R.burnoutExtraPenalty))
    expect(result.reasons).toContain('燃え尽き')
  })

  it('burnout_prone でも未判明なら追加ペナルティは効かない', () => {
    const emp = makeEmployee({
      stress: 80,
      lastTrainingTurn: 5,
      hiddenTrait: 'burnout_prone',
      hiddenTraitRevealed: false,
    })
    const result = calculateMotivationDelta(emp, 6)

    expect(result.delta).toBe(-R.highStressPenalty)
  })
})

// ============================================================
// calculateResignChance
// ============================================================
describe('calculateResignChance', () => {
  const base = BALANCE_CONFIG.events.employeeResignChance

  it('モチベーションが安全圏なら退職しない', () => {
    expect(calculateResignChance(makeEmployee({ motivation: R.safeMotivation }))).toBe(0)
    expect(calculateResignChance(makeEmployee({ motivation: 100 }))).toBe(0)
  })

  it('モチベーションが下がるほど退職確率が上がる', () => {
    const normal = calculateResignChance(makeEmployee({ motivation: 60 }))
    const low = calculateResignChance(makeEmployee({ motivation: 40 }))
    const critical = calculateResignChance(makeEmployee({ motivation: 20 }))

    expect(normal).toBeCloseTo(base * R.resignMultiplierNormal, 10)
    expect(low).toBeCloseTo(base * R.resignMultiplierLow, 10)
    expect(critical).toBeCloseTo(base * R.resignMultiplierCritical, 10)
    expect(normal).toBeLessThan(low)
    expect(low).toBeLessThan(critical)
  })

  it('burnout_prone(判明済み) は退職確率が上乗せされ、高ストレスでさらに上がる', () => {
    const plain = calculateResignChance(makeEmployee({ motivation: 40 }))
    const burnout = calculateResignChance(
      makeEmployee({ motivation: 40, hiddenTrait: 'burnout_prone', hiddenTraitRevealed: true })
    )
    const burnoutStressed = calculateResignChance(
      makeEmployee({
        motivation: 40,
        stress: 80,
        hiddenTrait: 'burnout_prone',
        hiddenTraitRevealed: true,
      })
    )

    expect(burnout).toBeCloseTo(plain * R.burnoutResignMultiplier, 10)
    expect(burnoutStressed).toBeCloseTo(
      plain * R.burnoutResignMultiplier * R.burnoutHighStressMultiplier,
      10
    )
  })

  it('inconsistent(判明済み) も退職確率を押し上げる', () => {
    const plain = calculateResignChance(makeEmployee({ motivation: 40 }))
    const inconsistent = calculateResignChance(
      makeEmployee({ motivation: 40, hiddenTrait: 'inconsistent', hiddenTraitRevealed: true })
    )

    expect(inconsistent).toBeCloseTo(plain * R.inconsistentResignMultiplier, 10)
  })

  it('退職確率は maxResignChance でクランプされる', () => {
    const worst = calculateResignChance(
      makeEmployee({
        motivation: 0,
        stress: 100,
        hiddenTrait: 'burnout_prone',
        hiddenTraitRevealed: true,
      })
    )
    expect(worst).toBeLessThanOrEqual(R.maxResignChance)
  })
})

// ============================================================
// rollPerformanceMultiplier
// ============================================================
describe('rollPerformanceMultiplier', () => {
  it('inconsistent 以外は常に 1 を返す', () => {
    expect(rollPerformanceMultiplier(makeEmployee(), () => 0)).toBe(1)
    expect(rollPerformanceMultiplier(makeEmployee(), () => 0.99)).toBe(1)
  })

  it('inconsistent でも未判明なら 1 を返す', () => {
    const emp = makeEmployee({ hiddenTrait: 'inconsistent', hiddenTraitRevealed: false })
    expect(rollPerformanceMultiplier(emp, () => 0)).toBe(1)
  })

  it('inconsistent(判明済み) は設定レンジの端から端まで振れる', () => {
    const emp = makeEmployee({ hiddenTrait: 'inconsistent', hiddenTraitRevealed: true })

    expect(rollPerformanceMultiplier(emp, () => 0)).toBeCloseTo(R.inconsistentMinPerformance, 10)
    expect(rollPerformanceMultiplier(emp, () => 1)).toBeCloseTo(R.inconsistentMaxPerformance, 10)
    const mid = rollPerformanceMultiplier(emp, () => 0.5)
    expect(mid).toBeGreaterThan(R.inconsistentMinPerformance)
    expect(mid).toBeLessThan(R.inconsistentMaxPerformance)
  })
})

// ============================================================
// calculateWorkforceMultiplier
// ============================================================
describe('calculateWorkforceMultiplier', () => {
  it('従業員ゼロなら 1（売上式を壊さない）', () => {
    expect(calculateWorkforceMultiplier([])).toBe(1)
  })

  it('基準モチベーションちょうどなら 1.0（既存バランスを動かさない）', () => {
    const emps = [makeEmployee({ motivation: R.neutralMotivation })]
    expect(calculateWorkforceMultiplier(emps)).toBeCloseTo(1, 10)
  })

  it('平均が基準を上回れば 1 を超え、上限は設定どおり', () => {
    const emps = [makeEmployee({ motivation: 100 })]
    expect(calculateWorkforceMultiplier(emps)).toBeCloseTo(1 + R.workforceUpsideAtMax, 10)
  })

  it('平均が下がれば 1 を下回り、下限は設定どおり', () => {
    const emps = [makeEmployee({ motivation: R.workforceMinMotivation })]
    expect(calculateWorkforceMultiplier(emps)).toBeCloseTo(1 - R.workforceDownsideAtMin, 10)
  })

  it('performanceMultiplier が実効モチベーションを押し下げる（inconsistent の実効化）', () => {
    const steady = [makeEmployee({ motivation: 100, performanceMultiplier: 1 })]
    const shaky = [makeEmployee({ motivation: 100, performanceMultiplier: 0.2 })]

    expect(calculateWorkforceMultiplier(shaky)).toBeLessThan(calculateWorkforceMultiplier(steady))
  })
})

// ============================================================
// processMonthlyRetention
// ============================================================
describe('processMonthlyRetention', () => {
  it('モチベーションを変動源に従って更新する', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [makeEmployee({ id: 1, motivation: 60, stress: 10, lastTrainingTurn: 5 })]

    processMonthlyRetention(() => 1) // 退職は起きない乱数

    expect(game.employees[0].motivation).toBe(60 + R.lowStressRecovery)
  })

  it('モチベーションは 10〜100 にクランプされる', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({ id: 1, motivation: 100, stress: 10, lastTrainingTurn: 5 }),
      makeEmployee({ id: 2, motivation: 12, stress: 80, lastTrainingTurn: 5 }),
      makeEmployee({ id: 3, motivation: 90, stress: 10, lastTrainingTurn: 5 }),
    ]

    processMonthlyRetention(() => 1)

    expect(game.employees[0].motivation).toBe(BALANCE_CONFIG.motivation.maxMotivation)
    expect(game.employees[1].motivation).toBe(BALANCE_CONFIG.motivation.minMotivation)
  })

  it('乱数が退職確率を下回った従業員が退職し、再採用コストが算出される', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({ id: 1, name: '辞める 花子', motivation: 15, stress: 80, salary: 300_000 }),
      makeEmployee({ id: 2, name: '残る 次郎', motivation: 90, stress: 10 }),
    ]

    const result = processMonthlyRetention(() => 0) // 必ず退職判定に通る

    expect(result.resignations).toHaveLength(1)
    expect(result.resignations[0].name).toBe('辞める 花子')
    expect(game.employees.map(e => e.id)).toEqual([2])
    expect(result.attritionCost).toBe(300_000 * R.rehireCostSalaryMultiplier)
  })

  it('安全圏のモチベーションなら乱数が 0 でも退職しない', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [makeEmployee({ id: 1, motivation: 100, stress: 0, lastTrainingTurn: 5 })]

    const result = processMonthlyRetention(() => 0)

    expect(result.resignations).toHaveLength(0)
    expect(result.attritionCost).toBe(0)
    expect(game.employees).toHaveLength(1)
  })

  it('1ヶ月に退職するのは最大1名', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({ id: 1, motivation: 15, stress: 80 }),
      makeEmployee({ id: 2, motivation: 15, stress: 80 }),
      makeEmployee({ id: 3, motivation: 15, stress: 80 }),
    ]

    const result = processMonthlyRetention(() => 0)

    expect(result.resignations).toHaveLength(R.maxResignationsPerMonth)
    expect(game.employees).toHaveLength(3 - R.maxResignationsPerMonth)
  })

  it('最低1名は必ず残る（合法手が消えるのを防ぐ）', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [makeEmployee({ id: 1, motivation: 10, stress: 100 })]

    const result = processMonthlyRetention(() => 0)

    expect(result.resignations).toHaveLength(0)
    expect(game.employees).toHaveLength(1)
  })

  it('退職予備軍（安全圏未満）を予兆として返す', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({ id: 1, motivation: 35, stress: 10, lastTrainingTurn: 5 }),
      makeEmployee({ id: 2, motivation: 95, stress: 10, lastTrainingTurn: 5 }),
    ]

    const result = processMonthlyRetention(() => 1)

    expect(result.atRisk.map(e => e.id)).toEqual([1])
  })

  it('inconsistent(判明済み) の performanceMultiplier が毎月振り直される', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({
        id: 1,
        motivation: 90,
        hiddenTrait: 'inconsistent',
        hiddenTraitRevealed: true,
      }),
      makeEmployee({ id: 2, motivation: 90 }),
    ]

    processMonthlyRetention(() => 1)

    expect(game.employees[0].performanceMultiplier).toBeCloseTo(R.inconsistentMaxPerformance, 10)
    expect(game.employees[1].performanceMultiplier).toBe(1)
  })

  it('退職者は成長履歴ではなく退職ログとして返り、従業員配列から消える', () => {
    const game = getGame()
    game.turn = 6
    game.employees = [
      makeEmployee({ id: 1, name: '退職 一郎', motivation: 15, stress: 80, department: 'sales' }),
      makeEmployee({ id: 2, motivation: 95 }),
    ]

    const result = processMonthlyRetention(() => 0)

    expect(result.resignations[0]).toMatchObject({ id: 1, name: '退職 一郎', department: 'sales' })
    expect(game.employees.some(e => e.id === 1)).toBe(false)
  })
})
