/**
 * HRManager.ts のユニットテスト
 *
 * テスト対象:
 * - canPromote: 昇進可能判定ロジック
 *   - 役職順: staff → senior (requiredAbility=70)
 *             senior → manager (requiredAbility=80)
 *             manager → director (requiredAbility=?)
 *             director → 昇進不可（最上位）
 * - calculateTeamCompatibility: チーム相性計算
 * - calculateGrowthMultiplier: 成長倍率（逓減型）
 */

import { describe, it, expect, vi } from 'vitest'
import { canPromote, calculateTeamCompatibility, calculateGrowthMultiplier } from '../lib/managers/HRManager'
import type { Employee } from '../lib/types/index'

// ============================================================
// getGame() モック（generateCandidate, generateCandidateForDepartment
// で使用されるが canPromote では使用しない）
// ============================================================
vi.mock('../lib/store/gameStore', () => ({
  getGame: vi.fn(() => ({
    turn: 1,
    employees: [],
  })),
}))

// ============================================================
// テスト用 Employee ファクトリ
// ============================================================
function makeEmployee(overrides: Partial<Employee> & { abilities?: Partial<Employee['abilities']> } = {}): Employee {
  const { abilities: abilitiesOverride, ...rest } = overrides
  return {
    id: 1,
    name: 'テスト 太郎',
    age: 30,
    personalityKey: 'analyst',
    abilities: {
      technical: 50,
      sales: 50,
      planning: 50,
      management: 50,
      ...abilitiesOverride,
    },
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
    salary: 3_000_000,
    department: 'development',
    position: 'staff',
    qualification: null,
    skillPoints: 0,
    unlockedSkills: [],
    growthHistory: [],
    ...rest,
  }
}

// ============================================================
// canPromote テスト
// POSITIONS.senior.requiredAbility = 70
// POSITIONS.manager.requiredAbility = 80
// POSITIONS.director.requiredAbility = ? (実際値を確認して閾値設定)
// ============================================================
describe('canPromote: 昇進可能判定', () => {
  describe('staff → senior への昇進（requiredAbility=70）', () => {
    it('平均能力値 < 70 の staff は昇進不可', () => {
      const emp = makeEmployee({
        position: 'staff',
        abilities: { technical: 60, sales: 60, planning: 60, management: 60 },
      })
      // 平均 = 60 < 70 → 昇進不可
      expect(canPromote(emp)).toBe(false)
    })

    it('平均能力値 = 70 の staff は昇進可', () => {
      const emp = makeEmployee({
        position: 'staff',
        abilities: { technical: 70, sales: 70, planning: 70, management: 70 },
      })
      // 平均 = 70 >= 70 → 昇進可
      expect(canPromote(emp)).toBe(true)
    })

    it('平均能力値 > 70 の staff は昇進可', () => {
      const emp = makeEmployee({
        position: 'staff',
        abilities: { technical: 80, sales: 80, planning: 80, management: 80 },
      })
      // 平均 = 80 >= 70 → 昇進可
      expect(canPromote(emp)).toBe(true)
    })

    it('平均能力値 69.9 の staff は昇進不可（境界値）', () => {
      // 合計 = 279 → 平均 = 69.75 → floor ではないので < 70 → 不可
      const emp = makeEmployee({
        position: 'staff',
        abilities: { technical: 70, sales: 70, planning: 70, management: 69 },
      })
      // 平均 = (70+70+70+69)/4 = 69.75 < 70 → 昇進不可
      expect(canPromote(emp)).toBe(false)
    })
  })

  describe('senior → manager への昇進（requiredAbility=80）', () => {
    it('平均能力値 < 80 の senior は昇進不可', () => {
      const emp = makeEmployee({
        position: 'senior',
        abilities: { technical: 75, sales: 75, planning: 75, management: 75 },
      })
      // 平均 = 75 < 80 → 昇進不可
      expect(canPromote(emp)).toBe(false)
    })

    it('平均能力値 = 80 の senior は昇進可', () => {
      const emp = makeEmployee({
        position: 'senior',
        abilities: { technical: 80, sales: 80, planning: 80, management: 80 },
      })
      // 平均 = 80 >= 80 → 昇進可
      expect(canPromote(emp)).toBe(true)
    })

    it('能力値にばらつきがあっても平均が 80 以上なら昇進可', () => {
      const emp = makeEmployee({
        position: 'senior',
        abilities: { technical: 100, sales: 70, planning: 80, management: 70 },
      })
      // 平均 = (100+70+80+70)/4 = 80 → 昇進可
      expect(canPromote(emp)).toBe(true)
    })
  })

  describe('director（最上位役職）', () => {
    it('director は昇進不可（最上位）', () => {
      const emp = makeEmployee({
        position: 'director',
        abilities: { technical: 100, sales: 100, planning: 100, management: 100 },
      })
      expect(canPromote(emp)).toBe(false)
    })
  })

  describe('不正な role', () => {
    it('未知の position は昇進不可として扱われること', () => {
      const emp = makeEmployee({ position: 'unknown_role' })
      expect(canPromote(emp)).toBe(false)
    })
  })
})

// ============================================================
// calculateGrowthMultiplier テスト（逓減型成長曲線）
// ============================================================
describe('calculateGrowthMultiplier: 逓減型成長倍率', () => {
  it('能力値 0〜69 は倍率 1.0 (通常成長)', () => {
    expect(calculateGrowthMultiplier(0)).toBe(1.0)
    expect(calculateGrowthMultiplier(50)).toBe(1.0)
    expect(calculateGrowthMultiplier(69)).toBe(1.0)
  })

  it('能力値 70〜79 は倍率 0.6 (成長鈍化)', () => {
    expect(calculateGrowthMultiplier(70)).toBe(0.6)
    expect(calculateGrowthMultiplier(75)).toBe(0.6)
    expect(calculateGrowthMultiplier(79)).toBe(0.6)
  })

  it('能力値 80〜89 は倍率 0.4 (かなり鈍化)', () => {
    expect(calculateGrowthMultiplier(80)).toBe(0.4)
    expect(calculateGrowthMultiplier(85)).toBe(0.4)
    expect(calculateGrowthMultiplier(89)).toBe(0.4)
  })

  it('能力値 90 以上は倍率 0.2 (ほぼ成長しない)', () => {
    expect(calculateGrowthMultiplier(90)).toBe(0.2)
    expect(calculateGrowthMultiplier(95)).toBe(0.2)
    expect(calculateGrowthMultiplier(100)).toBe(0.2)
  })

  it('高い能力ほど倍率が低くなる（単調減少）', () => {
    const values = [50, 70, 80, 90]
    const multipliers = values.map(v => calculateGrowthMultiplier(v))
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeLessThanOrEqual(multipliers[i - 1])
    }
  })
})

// ============================================================
// calculateTeamCompatibility テスト
// ============================================================
describe('calculateTeamCompatibility: チーム相性計算', () => {
  it('社員が 1 人以下の場合は 1.0 を返す', () => {
    expect(calculateTeamCompatibility([])).toBe(1.0)
    expect(calculateTeamCompatibility([makeEmployee()])).toBe(1.0)
  })

  it('personalityKey が未設定の社員ペアは相性影響なし (1.0)', () => {
    const emp1 = makeEmployee({ id: 1, personalityKey: '' })
    const emp2 = makeEmployee({ id: 2, personalityKey: '' })
    const result = calculateTeamCompatibility([emp1, emp2])
    // 相性計算がスキップされるため 1.0
    expect(result).toBe(1.0)
  })

  it('結果は 0.7〜1.3 の範囲内に収まる', () => {
    const emp1 = makeEmployee({ id: 1, personalityKey: 'analyst' })
    const emp2 = makeEmployee({ id: 2, personalityKey: 'leader' })
    const emp3 = makeEmployee({ id: 3, personalityKey: 'creative' })
    const result = calculateTeamCompatibility([emp1, emp2, emp3])
    expect(result).toBeGreaterThanOrEqual(0.7)
    expect(result).toBeLessThanOrEqual(1.3)
  })
})
