// 経営理論図鑑 - 解禁判定の純粋ロジック (DOM 非依存)
// AchievementManager と同型のパターン: check → 新規解禁分を返し、UI 通知は呼び出し元が行う

import { getGame } from '../store/gameStore'
import {
    THEORY_LIST, THEORIES,
    DOCUMENT_NATURE_THEORY_RULES, DOCUMENT_CATEGORY_THEORY_RULES, INVESTIGATED_THEORY_RULE,
    type TheoryDef, type TheoryCondition, type DocumentTheoryRule,
} from '../config/theories'
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
        case 'event':
            // イベント経路 (CEO 決裁の理論タグ等) からのみ解禁される。
            // 状態評価の checkTheories では常に false
            return false
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
// Phase B: CEO 決裁 → 理論タグ解決 (純関数)
// ============================================

/**
 * 書類の文脈から対応する経営理論を引く。
 * 優先順: 調査済み (サンクコスト) > nature (tradeoff/gamble/long_term) > カテゴリ。
 * 該当なしは null (無理にタグ付けしない)
 */
export function getTheoryTagForDocument(doc: {
    nature?: string
    category?: string
    investigationResult?: string | null
}): DocumentTheoryRule | null {
    if (doc.investigationResult) {
        return INVESTIGATED_THEORY_RULE
    }
    if (doc.nature && DOCUMENT_NATURE_THEORY_RULES[doc.nature]) {
        return DOCUMENT_NATURE_THEORY_RULES[doc.nature]
    }
    if (doc.category && DOCUMENT_CATEGORY_THEORY_RULES[doc.category]) {
        return DOCUMENT_CATEGORY_THEORY_RULES[doc.category]
    }
    return null
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
