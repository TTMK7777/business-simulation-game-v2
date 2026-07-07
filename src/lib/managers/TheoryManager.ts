// 経営理論図鑑 - 解禁判定の純粋ロジック (DOM 非依存)
// AchievementManager と同型のパターン: check → 新規解禁分を返し、UI 通知は呼び出し元が行う

import { getGame } from '../store/gameStore'
import { THEORY_LIST, THEORIES, type TheoryDef, type TheoryCondition } from '../config/theories'
import { debugLog } from '../gameConfig'

// ============================================
// 解禁条件チェック
// ============================================

export function checkTheoryCondition(condition: TheoryCondition): boolean {
    const game = getGame()
    switch (condition.type) {
        case 'products':
            return game.products.length >= condition.value
        case 'employees':
            return game.employees.length >= condition.value
        case 'marketShare':
            return game.marketShare >= condition.value
        case 'brandPower':
            return game.brandPower >= condition.value
        case 'turn':
            return game.turn >= condition.value
        case 'money_low':
            return game.money <= condition.value
        case 'monthly_profit': {
            // 直近の月次決算ベース (monthlyRevenue は決算時に更新される)。
            // 売上ゼロの開始直後を「黒字」と誤判定しないよう monthlyRevenue > 0 を要求
            const salaryTotal = game.employees.reduce(
                (sum: number, emp: any) => sum + (Number(emp.salary) || 0), 0)
            return game.monthlyRevenue > 0 && game.monthlyRevenue - salaryTotal >= condition.value
        }
        case 'total_sales': {
            const total = game.products.reduce(
                (sum: number, p: any) => sum + (Number(p.sales) || 0), 0)
            return total >= condition.value
        }
        default:
            return false
    }
}

// ============================================
// 解禁チェック & 記録
// ============================================

/** 全理論をチェックして新規解禁分を返す (UI 通知は呼び出し元が行う) */
export function checkTheories(): TheoryDef[] {
    const game = getGame()

    if (!Array.isArray(game.unlockedTheories)) {
        game.unlockedTheories = []
    }

    const newlyUnlocked: TheoryDef[] = []

    THEORY_LIST.forEach(theory => {
        if (game.unlockedTheories.includes(theory.id)) {
            return
        }
        if (checkTheoryCondition(theory.condition)) {
            game.unlockedTheories.push(theory.id)
            newlyUnlocked.push(theory)
            debugLog('event', `経営理論 解禁: ${theory.name}`, { id: theory.id })
        }
    })

    return newlyUnlocked
}

// ============================================
// 図鑑データ取得 (UI 表示用)
// ============================================

export function getTheoriesList(): Array<TheoryDef & { unlocked: boolean }> {
    const game = getGame()
    const unlockedIds = game.unlockedTheories || []
    return THEORY_LIST.map(theory => ({
        ...theory,
        unlocked: unlockedIds.includes(theory.id),
    }))
}

export function getTheoryProgress(): { unlocked: number; total: number; percentage: number } {
    const game = getGame()
    const total = THEORY_LIST.length
    const unlocked = (game.unlockedTheories || [])
        .filter((id: string) => THEORIES[id]).length
    return {
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    }
}
