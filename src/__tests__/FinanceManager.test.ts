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
 * - 後方互換: financeHistory が未定義の旧セーブはロード時の normalizeGameState() が空配列へ正規化する
 * - financeHistory は60件（5年分）でキャップされる
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateMonthlyRevenue,
  getLoan,
  repayLoan,
  getVariableCostRate,
  getContributionMarginRatio,
  getBreakEvenRevenue,
} from '../lib/managers/FinanceManager'
import { getGame, overwriteGameState, cloneDefaults, resetGameState, normalizeGameState } from '../lib/store/gameStore'
import { BALANCE_CONFIG } from '../lib/gameConfig'
import { OFFICE_LEVELS } from '../lib/config/offices'
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

// 品質50の単一製品の乗算前基礎売上。
// Wave 2 の変動費導入で売上係数を補正したため、数値を直書きせず設定から導出する
// （直書きするとバランス調整のたびにテストが本質と無関係に落ちる）
const BASE_REVENUE =
  BALANCE_CONFIG.economy.productRevenueBase + 50 * BALANCE_CONFIG.economy.productRevenueMultiplier

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

  it('旧セーブ相当（financeHistory 未定義）はロード時の normalizeGameState() が空配列へ正規化する', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.financeHistory
    overwriteGameState({
      ...oldSave,
      products: [makeProduct()],
      employees: [],
    })

    // ロード経路 (GameManager.loadGame) は overwriteGameState → normalizeGameState を必ず通る
    normalizeGameState()
    expect(getGame().financeHistory).toEqual([])
    expect(() => calculateMonthlyRevenue()).not.toThrow()
    expect(getGame().financeHistory.length).toBe(1)
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

    // カリスマ1名は +15%
    expect(byKey.charisma).toBe(Math.round(BASE_REVENUE * 0.15))
    expect(result.revenue).toBe(Math.floor(BASE_REVENUE * 1.15))
    expect(result.revenueDrivers.total).toBe(Math.round(BASE_REVENUE * 1.15))
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

    // revenue_bonus 保有者1名は +5%
    expect(byKey.skillBonus).toBe(Math.round(BASE_REVENUE * 0.05))
    expect(result.revenue).toBe(Math.floor(BASE_REVENUE * 1.05))
  })

  it('市場シェア・ブランド力の寄与額が正しく按分される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality: 50 })],
      employees: [],
      marketShare: 10, // 売上 × (1 + 10*0.02) = ×1.2
      brandPower: 4,   // さらに × (1 + 4*0.05) = ×1.2
      difficulty: 'normal',
    })

    const result = calculateMonthlyRevenue()
    const byKey = Object.fromEntries(result.revenueDrivers.contributions.map(c => [c.key, c.amount]))

    expect(byKey.marketShare).toBe(Math.round(BASE_REVENUE * 0.2))
    expect(byKey.brandPower).toBe(Math.round(BASE_REVENUE * 1.2 * 0.2))
    expect(result.revenue).toBe(Math.floor(BASE_REVENUE * 1.44))
  })

  it('寄与額の合計は実売上に近似する（丸め誤差は製品数の範囲に収まる）', () => {
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
    // 実売上は製品ごとに Math.floor、ドライバー分解は合計後に Math.round。
    // ずれは製品1つあたり最大1円なので、製品数が許容の上限になる
    expect(diff).toBeLessThanOrEqual(getGame().products.length)
  })
})

// ============================================================
// Wave 1-E: オフィス維持費（月次固定費）
// ============================================================
describe('calculateMonthlyRevenue: オフィス維持費（Wave 1-E）', () => {
  it('officeLevel に応じた固定費が計上され、純利益から差し引かれる', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      debt: 0,
      money: 10_000_000,
      officeLevel: 1,
    })

    const result = calculateMonthlyRevenue()

    expect(result.fixedCost).toBe(OFFICE_LEVELS[1].monthlyMaintenance)
    expect(result.profit).toBe(
      result.revenue - result.variableCost - result.salaryTotal - result.interest - result.fixedCost
    )
  })

  it('オフィスの規模が上がるほど固定費が増える（損益分岐点が上がる）', () => {
    const fixedCostAt = (officeLevel: number) => {
      overwriteGameState({
        ...cloneDefaults(),
        products: [makeProduct()],
        employees: [],
        difficulty: 'normal',
        debt: 0,
        money: 50_000_000,
        officeLevel,
      })
      return calculateMonthlyRevenue().fixedCost
    }

    expect(fixedCostAt(1)).toBeLessThan(fixedCostAt(3))
    expect(fixedCostAt(3)).toBeLessThan(fixedCostAt(5))
    expect(fixedCostAt(5)).toBe(OFFICE_LEVELS[5].monthlyMaintenance)
  })

  it('固定費は財務スナップショットにも記録される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      money: 10_000_000,
      officeLevel: 2,
    })

    calculateMonthlyRevenue()
    const snapshot = getGame().financeHistory[0]

    expect(snapshot.fixedCost).toBe(OFFICE_LEVELS[2].monthlyMaintenance)
    expect(snapshot.profit).toBe(
      snapshot.revenue - snapshot.variableCost - snapshot.salaryTotal - snapshot.interest -
      snapshot.fixedCost - snapshot.attritionCost
    )
  })

  it('固定費で資金がマイナスになれば倒産する（売上ゼロ・現金僅少）', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [],
      employees: [],
      money: 10_000,
      officeLevel: 1,
      debt: 0,
    })

    const result = calculateMonthlyRevenue()

    expect(result.isBankrupt).toBe(true)
    expect(getGame().isBankrupt).toBe(true)
  })
})

// ============================================================
// Wave 1-B 連携: 再採用コストと労働力ドライバー
// ============================================================
describe('calculateMonthlyRevenue: 退職コストと労働力ドライバー（Wave 1-B）', () => {
  it('引数で渡した再採用コストが P/L に計上される', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      money: 10_000_000,
      officeLevel: 1,
    })

    const result = calculateMonthlyRevenue(600_000)

    expect(result.attritionCost).toBe(600_000)
    expect(result.profit).toBe(
      result.revenue - result.variableCost - result.salaryTotal - result.interest - result.fixedCost - 600_000
    )
    expect(getGame().financeHistory[0].attritionCost).toBe(600_000)
  })

  it('再採用コスト未指定なら 0（既存呼び出しの後方互換）', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [],
      money: 10_000_000,
    })

    expect(calculateMonthlyRevenue().attritionCost).toBe(0)
  })

  it('基準モチベーションの従業員だけなら labor 係数は中立（既存バランスを動かさない）', () => {
    const neutral = BALANCE_CONFIG.retention.neutralMotivation
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [makeEmployee({ id: 1, motivation: neutral })],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      money: 10_000_000,
    })

    const result = calculateMonthlyRevenue()
    const workforce = result.revenueDrivers.contributions.find(c => c.key === 'workforce')

    expect(workforce).toBeDefined()
    expect(workforce!.amount).toBe(0)
    expect(result.revenue).toBe(BASE_REVENUE)
  })

  it('モチベーション低下は売上ドライバーにマイナス寄与として現れる', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [makeEmployee({ id: 1, motivation: 20 })],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      money: 10_000_000,
    })

    const result = calculateMonthlyRevenue()
    const workforce = result.revenueDrivers.contributions.find(c => c.key === 'workforce')!

    expect(workforce.amount).toBeLessThan(0)
    expect(result.revenue).toBeLessThan(BASE_REVENUE)
    expect(Math.abs(result.revenueDrivers.total - result.revenue)).toBeLessThanOrEqual(1)
  })

  it('モチベーション上昇は売上ドライバーにプラス寄与として現れる', () => {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct()],
      employees: [makeEmployee({ id: 1, motivation: 100 })],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      money: 10_000_000,
    })

    const result = calculateMonthlyRevenue()
    const workforce = result.revenueDrivers.contributions.find(c => c.key === 'workforce')!

    expect(workforce.amount).toBeGreaterThan(0)
    expect(result.revenue).toBeGreaterThan(BASE_REVENUE)
  })
})

// ============================================================
// Wave 2: 変動費（売上連動費用）
//
// 変動費が無かった頃、このゲームは限界利益率が常に 100% で、
// 損益分岐点が固定費合計に退化していた。以下はその欠陥が戻っていないことの確認。
// ============================================================
describe('変動費（Wave 2）', () => {
  function singleProductState(quality: number) {
    overwriteGameState({
      ...cloneDefaults(),
      products: [makeProduct({ quality })],
      employees: [],
      marketShare: 0,
      brandPower: 0,
      difficulty: 'normal',
      debt: 0,
      money: 50_000_000,
      officeLevel: 1,
    })
  }

  it('売上に連動する費用が計上され、限界利益率が 100% でなくなる', () => {
    singleProductState(50)

    const result = calculateMonthlyRevenue()

    expect(result.variableCost).toBeGreaterThan(0)
    const marginRatio = getContributionMarginRatio(result.revenue, result.variableCost)
    expect(marginRatio).toBeLessThan(1)
    expect(marginRatio).toBeGreaterThan(0)
  })

  it('変動費は純利益から差し引かれる（引き忘れていない）', () => {
    singleProductState(50)

    const result = calculateMonthlyRevenue()

    expect(result.profit).toBe(
      result.revenue - result.variableCost - result.salaryTotal - result.interest -
      result.fixedCost - result.attritionCost
    )
  })

  it('品質が高い製品ほど変動費率が上がる（売上は伸びるが儲けは薄くなる）', () => {
    expect(getVariableCostRate(80)).toBeGreaterThan(getVariableCostRate(20))

    singleProductState(20)
    const low = calculateMonthlyRevenue()
    singleProductState(80)
    const high = calculateMonthlyRevenue()

    // 高品質のほうが売上は大きい
    expect(high.revenue).toBeGreaterThan(low.revenue)
    // しかし限界利益率は低い＝1円の売上が固定費回収に回る割合は落ちる
    expect(getContributionMarginRatio(high.revenue, high.variableCost))
      .toBeLessThan(getContributionMarginRatio(low.revenue, low.variableCost))
  })

  it('変動費率には上限があり、限界利益がマイナスにならない', () => {
    // 品質が上限を振り切っても率は variableCostRateMax で頭打ちになる
    expect(getVariableCostRate(100_000)).toBe(BALANCE_CONFIG.economy.variableCostRateMax)
    expect(getVariableCostRate(100_000)).toBeLessThan(1)
  })

  it('変動費はスナップショットに記録される', () => {
    singleProductState(50)

    const result = calculateMonthlyRevenue()
    const snapshot = getGame().financeHistory[0]

    expect(snapshot.variableCost).toBe(result.variableCost)
  })

  it('旧セーブ（variableCost 未定義）は normalizeGameState() が 0 へ正規化する', () => {
    // 変動費導入前に保存された決算には variableCost が無い
    const legacySnapshot: any = {
      turn: 1, year: 2025, month: 1, revenue: 1_000_000, salaryTotal: 300_000, interest: 0,
      profit: 700_000, cash: 5_000_000, debt: 0, netWorth: 5_000_000,
      operatingCF: 700_000, financingCF: 0, revenueDrivers: { contributions: [], total: 1_000_000 },
    }
    overwriteGameState({ ...cloneDefaults(), financeHistory: [legacySnapshot] } as any)

    // ロード経路 (GameManager.loadGame) は overwriteGameState → normalizeGameState を必ず通る
    normalizeGameState()

    expect(getGame().financeHistory[0].variableCost).toBe(0)
  })

  it('損益分岐点売上高は固定費合計より必ず大きい（固定費そのものではない）', () => {
    singleProductState(50)
    const result = calculateMonthlyRevenue()

    const fixedCostTotal = result.salaryTotal + result.interest + result.fixedCost + result.attritionCost
    const marginRatio = getContributionMarginRatio(result.revenue, result.variableCost)
    const breakEven = getBreakEvenRevenue(fixedCostTotal, marginRatio)

    expect(breakEven).toBeGreaterThan(fixedCostTotal)
    expect(breakEven).toBeCloseTo(fixedCostTotal / marginRatio, 6)
  })

  it('限界利益率が 0 以下なら損益分岐点は存在しない（無限大を返す）', () => {
    expect(getBreakEvenRevenue(1_000_000, 0)).toBe(Infinity)
    expect(getBreakEvenRevenue(1_000_000, -0.1)).toBe(Infinity)
  })

  it('売上ゼロの月は限界利益率を 0 として扱う（0除算を作らない）', () => {
    expect(getContributionMarginRatio(0, 0)).toBe(0)
  })

  it('変動費の導入で基準品質の利益水準は概ね維持されている（売上係数の補正が効いている）', () => {
    // 基準品質(productQualityBase)の製品を、変動費が無かった頃の売上係数で計算した場合の利益と比較する。
    // 補正が外れると、この差が数十%単位で開く。
    const quality = BALANCE_CONFIG.economy.productQualityBase
    singleProductState(quality)
    const result = calculateMonthlyRevenue()

    const legacyRevenue = 50_000 + quality * 10_000  // 変動費導入前の売上係数
    const legacyProfit = legacyRevenue - result.salaryTotal - result.interest - result.fixedCost

    const contributionMargin = result.revenue - result.variableCost
    expect(contributionMargin).toBeCloseTo(legacyRevenue, -2)  // 100円単位で一致

    const drift = Math.abs(result.profit - legacyProfit)
    expect(drift).toBeLessThan(Math.abs(legacyProfit) * 0.01)
  })
})
