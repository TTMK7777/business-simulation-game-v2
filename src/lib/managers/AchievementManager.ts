// ビジネスエンパイア 2.0 - Achievement Manager
// game.ts から抽出した実績関連の純粋ロジック

import { getGame } from '../store/gameStore'
import { ACHIEVEMENTS, ACHIEVEMENT_RARITIES, debugLog } from '../gameConfig'
import type { Achievement } from '../types'

// ============================================
// 実績条件チェック
// ============================================

/** 実績条件をチェック (game.ts:917-994) */
export function checkAchievementCondition(achievement: Achievement): boolean {
    const game = getGame()
    const condition = achievement.condition
    const value = condition.value
    const comparison = condition.comparison || 'gte'

    const compare = (actual: number): boolean => {
        switch (comparison) {
            case 'gte': return actual >= value
            case 'lte': return actual <= value
            case 'eq': return actual === value
            default: return actual >= value
        }
    }

    switch (condition.type) {
        case 'money':
            return compare(game.money)

        case 'employees':
            return compare(game.employees.length)

        case 'products':
            return compare(game.products.length)

        case 'marketShare':
            return compare(game.marketShare)

        case 'brandPower':
            return compare(game.brandPower)

        case 'turns':
            return compare(game.turn)

        case 'officeLevel':
            return compare(game.officeLevel)

        case 'monthly_profit':
            const salaryTotal = game.employees.reduce((sum, emp) => sum + emp.salary, 0)
            const profit = game.monthlyRevenue - salaryTotal
            return compare(profit)

        case 'debt_free_rich':
            return game.debt === 0 && compare(game.money)

        case 'avg_ability':
            if (game.employees.length === 0) return false
            const avgAbility = game.employees.reduce((sum, emp) => {
                const abilities = emp.abilities
                const avg = (abilities.technical + abilities.sales + abilities.planning + abilities.management) / 4
                return sum + avg
            }, 0) / game.employees.length
            return compare(avgAbility)

        case 'max_quality':
            const maxQuality = Math.max(0, ...game.products.map(p => p.quality || 0))
            return compare(maxQuality)

        case 'product_sales':
            const maxProductSales = Math.max(0, ...game.products.map(p => p.sales || 0))
            return compare(maxProductSales)

        case 'comeback':
            // 資金が100万円以下になった後、指定値以上に回復
            if (game.money <= 1000000) {
                (game as any).wasLowMoney = true
            }
            return (game as any).wasLowMoney && compare(game.money)

        case 'speed_share':
            // 6ターン以内に指定シェア達成
            return game.turn <= 6 && compare(game.marketShare)

        default:
            return false
    }
}

// ============================================
// 実績チェック & 解除
// ============================================

/** 全実績をチェックして新規解除分を返す（UI操作なし）(game.ts:995-1026) */
export function checkAchievements(): Achievement[] {
    const game = getGame()

    if (!game.unlockedAchievements) {
        game.unlockedAchievements = []
    }

    const newlyUnlocked: Achievement[] = []

    ACHIEVEMENTS.forEach(achievement => {
        // 既に解除済みならスキップ
        if (game.unlockedAchievements.includes(achievement.id)) {
            return
        }

        // 条件をチェック
        if (checkAchievementCondition(achievement)) {
            game.unlockedAchievements.push(achievement.id)
            newlyUnlocked.push(achievement)
            debugLog('event', `実績解除: ${achievement.name}`, { id: achievement.id })
        }
    })

    // UI通知は呼び出し元で行う（showAchievementUnlocked は含めない）
    return newlyUnlocked
}

// ============================================
// 実績データ取得
// ============================================

/** 実績一覧を取得（UI表示用）(game.ts:1027-1033) */
export function getAchievementsList() {
    const game = getGame()
    return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: (game.unlockedAchievements || []).includes(achievement.id),
        rarity: ACHIEVEMENT_RARITIES[achievement.rarity]
    }))
}

/** 実績進捗を取得 (game.ts:1036-1043) */
export function getAchievementProgress() {
    const game = getGame()
    const total = ACHIEVEMENTS.filter(a => !a.hidden).length
    const unlocked = (game.unlockedAchievements || []).filter(id => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id)
        return achievement && !achievement.hidden
    }).length
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) }
}
