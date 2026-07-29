/**
 * gameStore.ts のユニットテスト（Sprint C 回帰テスト）
 *
 * テスト対象:
 * - I-1: _pendingCausalEffects の正規化（normalizeGameState で配列保証）
 * - I-3: wasLowMoney の型バリデーション（normalizeGameState で boolean 保証）
 * - I-6: tutorialCompleted / tutorialStep の型バリデーション
 *   - 旧セーブからのロードで欠損フィールドが正しくデフォルト復元されること
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGame,
  overwriteGameState,
  cloneDefaults,
  normalizeGameState,
  resetGameState,
} from '../lib/store/gameStore'

beforeEach(() => {
  resetGameState()
})

describe('I-6: tutorialCompleted / tutorialStep バリデーション', () => {
  it('旧セーブで tutorialCompleted フィールドが欠損していたら false に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.tutorialCompleted
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(false)
  })

  it('tutorialCompleted が boolean 以外（文字列）でも false に強制される', () => {
    const corrupted: any = { ...cloneDefaults(), tutorialCompleted: 'yes' }
    overwriteGameState(corrupted)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(false)
  })

  it('tutorialCompleted=true のセーブはそのまま保持される', () => {
    const completedSave: any = { ...cloneDefaults(), tutorialCompleted: true }
    overwriteGameState(completedSave)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(true)
  })

  it('tutorialStep が負値や非数値なら 0 に正規化される', () => {
    const corrupted: any = { ...cloneDefaults(), tutorialStep: -5 }
    overwriteGameState(corrupted)
    normalizeGameState()
    expect(getGame().tutorialStep).toBe(0)

    const corrupted2: any = { ...cloneDefaults(), tutorialStep: 'invalid' }
    overwriteGameState(corrupted2)
    normalizeGameState()
    expect(getGame().tutorialStep).toBe(0)
  })
})

describe('I-3: wasLowMoney 型バリデーション', () => {
  it('旧セーブで wasLowMoney フィールドが欠損していたら false に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.wasLowMoney
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().wasLowMoney).toBe(false)
  })

  it('wasLowMoney=true のセーブはそのまま保持される（comeback 実績判定継続）', () => {
    const recoveringSave: any = { ...cloneDefaults(), wasLowMoney: true }
    overwriteGameState(recoveringSave)

    normalizeGameState()

    expect(getGame().wasLowMoney).toBe(true)
  })
})

describe('I-1: _pendingCausalEffects 配列保証', () => {
  it('旧セーブで _pendingCausalEffects が欠損していたら空配列に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave._pendingCausalEffects
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(Array.isArray(getGame()._pendingCausalEffects)).toBe(true)
    expect(getGame()._pendingCausalEffects.length).toBe(0)
  })

  it('_pendingCausalEffects が非配列（オブジェクト）の場合も空配列に正規化される', () => {
    const corrupted: any = { ...cloneDefaults(), _pendingCausalEffects: { malicious: true } }
    overwriteGameState(corrupted)

    normalizeGameState()

    expect(Array.isArray(getGame()._pendingCausalEffects)).toBe(true)
    expect(getGame()._pendingCausalEffects.length).toBe(0)
  })
})

describe('CEO mode フィールドの正規化', () => {
  it('gameMode が未定義なら management にフォールバック', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.gameMode
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().gameMode).toBe('management')
  })

  it('gameMode=ceo は保持される（CEOセーブのロード経路）', () => {
    const ceoSave: any = { ...cloneDefaults(), gameMode: 'ceo' }
    overwriteGameState(ceoSave)

    normalizeGameState()

    expect(getGame().gameMode).toBe('ceo')
  })
})

describe('Wave 1: 定着フィールドと財務スナップショットの正規化', () => {
  it('旧セーブの従業員は stress / lastTrainingTurn / performanceMultiplier が既定値で補完される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      turn: 20,
      employees: [
        {
          id: 1,
          name: '旧 太郎',
          personalityKey: 'logical',
          abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
          subTraits: [],
          hiddenTrait: 'late_bloomer',
          hiddenTraitRevealed: false,
          joinedTurn: 5,
          motivation: 60,
          salary: 300_000,
          department: 'development',
          position: 'staff',
          qualification: null,
          skillPoints: 0,
          unlockedSkills: [],
          growthHistory: [],
        },
      ] as any,
    })

    normalizeGameState()
    const emp = getGame().employees[0]

    expect(emp.stress).toBe(0)
    // 放置判定の起点は入社ターン（研修履歴が無いため）
    expect(emp.lastTrainingTurn).toBe(5)
    expect(emp.performanceMultiplier).toBe(1)
  })

  it('旧セーブの財務スナップショットは fixedCost / attritionCost が 0 で補完される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      financeHistory: [
        {
          turn: 4,
          year: 2025,
          month: 2,
          revenue: 1_000_000,
          salaryTotal: 400_000,
          interest: 0,
          profit: 600_000,
          cash: 5_000_000,
          debt: 0,
          netWorth: 5_000_000,
          operatingCF: 600_000,
          financingCF: 0,
          revenueDrivers: { contributions: [], total: 1_000_000 },
        },
      ] as any,
    })

    normalizeGameState()
    const snapshot = getGame().financeHistory[0]

    expect(snapshot.fixedCost).toBe(0)
    expect(snapshot.attritionCost).toBe(0)
  })
})
