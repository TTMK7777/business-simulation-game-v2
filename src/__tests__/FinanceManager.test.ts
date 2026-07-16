/**
 * FinanceManager.ts のユニットテスト（Phase 1 見える化スプリント: 財務3表 + 売上ドライバー分解）
 *
 * テスト対象:
 * - calculateMonthlyRevenue(): 月次決算スナップショット (financeHistory) の記録
 *   - P/L（売上/人件費/利息/純利益）・簡易B/S（現金/借入残高/純資産）・
 *     CF（営業CF=純利益／財務CF=Δ借入残高）が正しく記録される
 *   - 財務CFが融資・返済アクションによる借入残高の変化と一致する
 * - 売上ドライバー分解（revenueDrivers）
 *   - 寄与額の合計が実売上に近似する（floor丸め誤差の範囲内）
 *   - カリスマ社員・Tier3スキル・市場シェア・ブランド力それぞれの寄与額が正しい
 * - 後方互換: financeHistory が未定義の旧セーブでも例外を投げず自己初期化する
 * - financeHistory は60件（5年分）でキャップされる
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { calculateMonthlyRevenue, getLoan, repayLoan } from '../lib/managers/FinanceManager'
import { getGame, overwriteGameState, cloneDefaults, resetGameState } from '../lib/store/gameStore'
import type { Employee, Product } from '../lib/types/index'

beforeEach(() => {
  resetGameState()
})

// ============================================================
// テスト用ファクトリ
// ============================================================
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
    ...overrides,
  }
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'テスト製品',
    quality: 50,
    sales: 0,
    ...overrides,
  }
}

// 品質50の単一製品の乗算前基礎売上（productRevenueBase=50000 + quality*productRevenueMultiplier=500000）
const BASE_REVENUE = 550_000

describe('calculateMonthlyRevenue: 月次決算スナップショット記録', () => {
  it('決算後に financeHistory へ1件記録される（P/L・簡易B/S・CFを含む）', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      debt: 0,
      money: 10_000_000,
      turn: 1,
      year: 2025,
      month: 2,
    })

    const result = calculateMonthlyRevenue()
    const game = getGame()

    expect(game.financeHistory?.length).toBe(1)
    const snapshot = game.financeHistory![0]

    // P/L
    expect(snapshot.revenue).toBe(result.revenue)
    expect(snapshot.salaryTotal).toBe(result.salaryTotal)
    expect(snapshot.interest).toBe(result.interest)
    expect(snapshot.profit).toBe(result.profit)

    // 簡易B/S
    expect(snapshot.cash).toBe(game.money)
    expect(snapshot.debt).toBe(0)
    expect(snapshot.netWorth).toBe(game.money)

    // CF（初回は前回スナップショットが無いため financingCF=0）
    expect(snapshot.operatingCF).toBe(result.profit)
    expect(snapshot.financingCF).toBe(0)
  })

  it('財務CFは借入残高の対前回差分と一致する（融資→決算→返済→決算）', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      debt: 0,
      money: 10_000_000,
    })

    // 1ヶ月目: 借入なし
    calculateMonthlyRevenue()

    // 融資実行 → 2ヶ月目決算
    const loan = getLoan()
    expect(loan.success).toBe(true)
    const debtAfterLoan = getGame().debt
    calculateMonthlyRevenue()
    const history2 = getGame().financeHistory!
    const snapshot2 = history2[history2.length - 1]
    expect(snapshot2.financingCF).toBe(debtAfterLoan) // 前回debt=0からの差分 = 融資額

    // 返済実行 → 3ヶ月目決算
    const repay = repayLoan()
    expect(repay.success).toBe(true)
    const debtAfterRepay = getGame().debt
    calculateMonthlyRevenue()
    const history3 = getGame().financeHistory!
    const snapshot3 = history3[history3.length - 1]
    expect(snapshot3.financingCF).toBe(debtAfterRepay - debtAfterLoan) // 負値（返済分）
  })

  it('financeHistory は60件を超えると古いものから切り捨てられる', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
    })

    for (let i = 0; i < 61; i++) {
      calculateMonthlyRevenue()
    }

    const history = getGame().financeHistory!
    expect(history.length).toBe(60)
  })

  it('旧セーブ相当（financeHistory 未定義）でも例外を投げず自己初期化する', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.financeHistory
    overwriteGameState({
      ...oldSave,
      products: [makeProduct()],
      employees: [],
    })

    expect(getGame().financeHistory).toBeUndefined()
    expect(() => calculateMonthlyRevenue()).not.toThrow()
    expect(getGame().financeHistory?.length).toBe(1)
  })
})

describe('売上ドライバー分解 (revenueDrivers)', () => {
  it('ボーナスなし（マーケットシェア0・ブランド0・カリスマなし・スキルなし）は base のみが寄与する', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality: 50 })],
      employees: [],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
    })

    const result = calculateMonthlyRevenue()
    const { contributions, total } = result.revenueDrivers

    const byKey = Object.fromEntries(contributions.map(c => [c.key, c.amount]))
    expect(byKey.base).toBe(BASE_REVENUE)
    expect(byKey.charisma).toBe(0)
    expect(byKey.skillBonus).toBe(0)
    expect(byKey.marketShare).toBe(0)
    expect(byKey.brandPower).toBe(0)
    expect(byKey.difficulty).toBe(0)
    expect(total).toBe(BASE_REVENUE)
    expect(result.revenue).toBe(BASE_REVENUE)
  })

  it('カリスマ社員1名は+15%分の寄与額を生む', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality: 50 })],
      employees: [makeEmployee({ personalityKey: 'charismatic' })],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
    })

    const result = calculateMonthlyRevenue()
    const byKey = Object.fromEntries(result.revenueDrivers.contributions.map(c => [c.key, c.amount]))

    // 550000 * 1.15 - 550000 = 82500
    expect(byKey.charisma).toBe(82_500)
    expect(result.revenue).toBe(632_500)
    expect(result.revenueDrivers.total).toBe(632_500)
  })

  it('Tier3スキル revenue_bonus 保有者1名は+5%分の寄与額を生む', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality: 50 })],
      employees: [makeEmployee({ unlockedSkills: ['sales_closing'] })],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
    })

    const result = calculateMonthlyRevenue()
    const byKey = Object.fromEntries(result.revenueDrivers.contributions.map(c => [c.key, c.amount]))

    // 550000 * 1.05 - 550000 = 27500
    expect(byKey.skillBonus).toBe(27_500)
    expect(result.revenue).toBe(577_500)
  })

  it('市場シェア・ブランド力の寄与額が正しく按分される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality: 50 })],
      employees: [],
      marketShare: 10, // 550000 * (1+10*0.02=1.2) - 550000 = 110000
      brandPower: 4,   // 660000 * (1+4*0.05=1.2) - 660000 = 132000
      difficulty: 'normal',
    })

    const result = calculateMonthlyRevenue()
    const byKey = Object.fromEntries(result.revenueDrivers.contributions.map(c => [c.key, c.amount]))

    expect(byKey.marketShare).toBe(110_000)
    expect(byKey.brandPower).toBe(132_000)
    expect(result.revenue).toBe(792_000)
  })

  it('寄与額の合計は実売上に近似する（floor丸め誤差1円以内）', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [
        makeProduct({ id: 1, quality: 37 }),
        makeProduct({ id: 2, quality: 61 }),
        makeProduct({ id: 3, quality: 12 }),
      ],
      employees: [
        makeEmployee({ id: 1, personalityKey: 'charismatic' }),
        makeEmployee({ id: 2, unlockedSkills: ['sales_closing'] }),
      ],
      marketShare: 7.3,
      brandPower: 2.6,
      difficulty: 'hard',
    })

    const result = calculateMonthlyRevenue()
    const diff = Math.abs(result.revenueDrivers.total - result.revenue)
    expect(diff).toBeLessThanOrEqual(1)
  })
})
