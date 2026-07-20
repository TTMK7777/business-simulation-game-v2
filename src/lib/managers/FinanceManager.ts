// ビジネスエンパイア 2.0 - 財務管理
// game.ts:3781-3937 から抽出（純粋ロジック、DOM操作なし）

import { getGame } from '../store/gameStore'
import { GAME_CONSTANTS, BALANCE_CONFIG, debugLog } from '../gameConfig'
import { SKILL_EFFECTS, SKILL_SPECIAL_LOOKUP } from '../config/skills'
import type { FinanceSnapshot, RevenueDriverBreakdown } from '../types'

/** financeHistory の最大保持件数（5年分の月次決算） */
const FINANCE_HISTORY_LIMIT = 60

const LOAN_AMOUNT = GAME_CONSTANTS.LOAN_AMOUNT
const LOAN_INTEREST_RATE = GAME_CONSTANTS.LOAN_INTEREST_RATE

// ============================================
// 融資・返済結果型
// ============================================
export interface LoanResult {
    success: boolean
    message: string
    amount?: number
    interestRate?: number
}

export interface RepayResult {
    success: boolean
    message: string
    repaidAmount?: number
    remainingDebt?: number
}

export interface MonthlyRevenueResult {
    revenue: number
    salaryTotal: number
    interest: number
    profit: number
    isBankrupt: boolean
    productRevenues: { name: string; revenue: number }[]
    /** 今月の売上ドライバー分解（円建て寄与額） */
    revenueDrivers: RevenueDriverBreakdown
}

// ============================================
// 融資実行
// ============================================
export function getLoan(): LoanResult {
    const game = getGame()

    game.money += LOAN_AMOUNT
    game.debt += LOAN_AMOUNT

    return {
        success: true,
        message: `500万円の融資を受けました\n利率: ${(LOAN_INTEREST_RATE * 100).toFixed(1)}%/月`,
        amount: LOAN_AMOUNT,
        interestRate: LOAN_INTEREST_RATE
    }
}

// ============================================
// 返済実行
// ============================================
export function repayLoan(): RepayResult {
    const game = getGame()

    if (game.debt <= 0) {
        return {
            success: false,
            message: '現在の借入はありません'
        }
    }

    const maxRepay = Math.min(game.debt, game.money)
    if (maxRepay <= 0) {
        return {
            success: false,
            message: '返済に充てる資金がありません'
        }
    }

    game.money -= maxRepay
    game.debt -= maxRepay

    return {
        success: true,
        message: `${Math.floor(maxRepay / 10000)}万円を返済しました`,
        repaidAmount: maxRepay,
        remainingDebt: game.debt
    }
}

// ============================================
// 月次収益計算
// ============================================
export function calculateMonthlyRevenue(): MonthlyRevenueResult {
    const game = getGame()
    let revenue = 0
    const difficultyMultiplier = BALANCE_CONFIG.difficultyMultipliers[(game.difficulty || 'normal') as keyof typeof BALANCE_CONFIG.difficultyMultipliers]
    const productRevenues: { name: string; revenue: number }[] = []

    // Tier3 スキル特殊効果の保有数 (従来は表示専用で計算未接続だった)
    const revenueBonusHolders = game.employees.filter((emp: any) =>
        emp.unlockedSkills?.some((id: string) => SKILL_SPECIAL_LOOKUP[id] === 'revenue_bonus')).length
    const costReductionHolders = game.employees.filter((emp: any) =>
        emp.unlockedSkills?.some((id: string) => SKILL_SPECIAL_LOOKUP[id] === 'cost_reduction')).length

    // 売上ドライバー分解用: 乗算チェーンの各段階を経た合計値をウォーターフォールで積算する。
    // 実際の売上計算 (productRevenue の Math.floor) は変更しない。表示専用の並行集計。
    let driverBaseTotal = 0
    let driverAfterCharisma = 0
    let driverAfterSkill = 0
    let driverAfterShare = 0
    let driverAfterBrand = 0
    let driverAfterDifficulty = 0

    game.products.forEach((product: any) => {
        let salesMultiplier = 1.0

        // カリスマ性格の売上ボーナス (逓減: 1人+15%、上限+50% — 無限スタック防止)
        const charismaticCount = game.employees.filter((emp: any) => emp.personalityKey === 'charismatic').length
        const charismaMultiplier = charismaticCount > 0 ? (1 + Math.min(0.5, charismaticCount * 0.15)) : 1
        salesMultiplier *= charismaMultiplier

        // Tier3 スキル: revenue_bonus (売上+5%/保有者)
        const skillMultiplier = revenueBonusHolders > 0 ? (1 + SKILL_EFFECTS.revenue_bonus.value * revenueBonusHolders) : 1
        salesMultiplier *= skillMultiplier

        // 市場シェアボーナス
        const shareMultiplier = (1 + game.marketShare * BALANCE_CONFIG.economy.marketShareRevenueBonus)
        salesMultiplier *= shareMultiplier

        // ブランド力ボーナス
        const brandMultiplier = (1 + game.brandPower * BALANCE_CONFIG.economy.brandPowerRevenueBonus)
        salesMultiplier *= brandMultiplier

        // 難易度調整
        salesMultiplier *= difficultyMultiplier.revenueMultiplier

        // 製品売上計算（基本売上 + 品質連動）
        const baseRevenue = BALANCE_CONFIG.economy.productRevenueBase
        const qualityRevenue = product.quality * BALANCE_CONFIG.economy.productRevenueMultiplier
        const preMultiplier = baseRevenue + qualityRevenue
        const productRevenue = Math.floor(preMultiplier * salesMultiplier)

        product.sales += productRevenue
        revenue += productRevenue

        productRevenues.push({ name: product.name, revenue: productRevenue })

        // ドライバー分解: 乗算チェーンと同じ順序で段階的に積算する
        driverBaseTotal += preMultiplier
        driverAfterCharisma += preMultiplier * charismaMultiplier
        driverAfterSkill += preMultiplier * charismaMultiplier * skillMultiplier
        driverAfterShare += preMultiplier * charismaMultiplier * skillMultiplier * shareMultiplier
        driverAfterBrand += preMultiplier * charismaMultiplier * skillMultiplier * shareMultiplier * brandMultiplier
        driverAfterDifficulty += preMultiplier * salesMultiplier

        debugLog('balance', `製品売上計算: ${product.name}`, {
            baseRevenue,
            qualityRevenue,
            salesMultiplier,
            finalRevenue: productRevenue
        })
    })

    const revenueDrivers: RevenueDriverBreakdown = {
        contributions: [
            { key: 'base', label: '製品基礎売上', amount: Math.round(driverBaseTotal) },
            { key: 'charisma', label: 'カリスマ社員ボーナス', amount: Math.round(driverAfterCharisma - driverBaseTotal) },
            { key: 'skillBonus', label: 'スキル効果(売上+)', amount: Math.round(driverAfterSkill - driverAfterCharisma) },
            { key: 'marketShare', label: '市場シェアボーナス', amount: Math.round(driverAfterShare - driverAfterSkill) },
            { key: 'brandPower', label: 'ブランド力ボーナス', amount: Math.round(driverAfterBrand - driverAfterShare) },
            { key: 'difficulty', label: '難易度調整', amount: Math.round(driverAfterDifficulty - driverAfterBrand) }
        ],
        total: Math.round(driverAfterDifficulty)
    }

    // Tier3 スキル: cost_reduction (運営コスト-10%/保有者、上限-30%)
    const rawSalaryTotal = game.employees.reduce((sum: number, emp: any) => sum + emp.salary, 0)
    const costCut = Math.min(0.3, SKILL_EFFECTS.cost_reduction.value * costReductionHolders)
    const salaryTotal = Math.floor(rawSalaryTotal * (1 - costCut))
    const interest = game.debt > 0 ? Math.floor(game.debt * LOAN_INTEREST_RATE) : 0
    game.monthlyRevenue = revenue
    game.revenueHistory.push(revenue)
    const profit = revenue - salaryTotal - interest
    game.money += profit

    const isBankrupt = game.money < 0
    if (isBankrupt) {
        game.isBankrupt = true
    }

    // 財務3表: 月次決算スナップショットを記録する。
    // 旧セーブ (financeHistory 未定義) はロード時に gameStore.normalizeGameState() が
    // 空配列へ正規化する (正規化責務は store 層に一元化)
    const financeHistory = game.financeHistory
    const cash = game.money
    const netWorth = cash - game.debt
    const previousDebt = financeHistory.length > 0
        ? financeHistory[financeHistory.length - 1].debt
        : 0
    const financingCF = game.debt - previousDebt
    const operatingCF = profit

    const snapshot: FinanceSnapshot = {
        turn: game.turn,
        year: game.year,
        month: game.month,
        revenue,
        salaryTotal,
        interest,
        profit,
        cash,
        debt: game.debt,
        netWorth,
        operatingCF,
        financingCF,
        revenueDrivers
    }
    financeHistory.push(snapshot)
    if (financeHistory.length > FINANCE_HISTORY_LIMIT) {
        financeHistory.shift()
    }

    return {
        revenue,
        salaryTotal,
        interest,
        profit,
        isBankrupt,
        productRevenues,
        revenueDrivers
    }
}
