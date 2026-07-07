// ビジネスエンパイア 2.0 - 財務管理
// game.ts:3781-3937 から抽出（純粋ロジック、DOM操作なし）

import { getGame } from '../store/gameStore'
import { GAME_CONSTANTS, BALANCE_CONFIG, debugLog } from '../gameConfig'
import { SKILL_EFFECTS, SKILL_SPECIAL_LOOKUP } from '../config/skills'

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

    game.products.forEach((product: any) => {
        let salesMultiplier = 1.0

        // カリスマ性格の売上ボーナス (逓減: 1人+15%、上限+50% — 無限スタック防止)
        const charismaticCount = game.employees.filter((emp: any) => emp.personalityKey === 'charismatic').length
        if (charismaticCount > 0) {
            salesMultiplier *= (1 + Math.min(0.5, charismaticCount * 0.15))
        }

        // Tier3 スキル: revenue_bonus (売上+5%/保有者)
        if (revenueBonusHolders > 0) {
            salesMultiplier *= (1 + SKILL_EFFECTS.revenue_bonus.value * revenueBonusHolders)
        }

        // 市場シェアボーナス
        salesMultiplier *= (1 + game.marketShare * BALANCE_CONFIG.economy.marketShareRevenueBonus)

        // ブランド力ボーナス
        salesMultiplier *= (1 + game.brandPower * BALANCE_CONFIG.economy.brandPowerRevenueBonus)

        // 難易度調整
        salesMultiplier *= difficultyMultiplier.revenueMultiplier

        // 製品売上計算（基本売上 + 品質連動）
        const baseRevenue = BALANCE_CONFIG.economy.productRevenueBase
        const qualityRevenue = product.quality * BALANCE_CONFIG.economy.productRevenueMultiplier
        const productRevenue = Math.floor((baseRevenue + qualityRevenue) * salesMultiplier)

        product.sales += productRevenue
        revenue += productRevenue

        productRevenues.push({ name: product.name, revenue: productRevenue })

        debugLog('balance', `製品売上計算: ${product.name}`, {
            baseRevenue,
            qualityRevenue,
            salesMultiplier,
            finalRevenue: productRevenue
        })
    })

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

    return {
        revenue,
        salaryTotal,
        interest,
        profit,
        isBankrupt,
        productRevenues
    }
}
