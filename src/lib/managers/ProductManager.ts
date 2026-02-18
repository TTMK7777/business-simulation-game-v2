// ビジネスエンパイア 2.0 - 製品・マーケティング管理
// game.ts:3604-3780 から抽出（純粋ロジック、DOM操作なし）

import { getGame } from '../store/gameStore'
import { PERSONALITIES } from '../config/personalities'

// ============================================
// 結果型
// ============================================
export interface DevelopProductResult {
    success: boolean
    message: string
    product?: {
        id: number
        name: string
        quality: number
        sales: number
    }
    bonusMessages: string[]
    teamCompatibility?: number
}

export interface MarketingStrategyConfig {
    share: number
    brand: number
    name: string
}

export interface ExecuteMarketingResult {
    success: boolean
    message: string
    strategy: string
    shareChange: number
    brandChange: number
    newMarketShare: number
    newBrandPower: number
}

// ============================================
// チーム相性計算（HRManager から再利用可能にするためここでも定義）
// TODO: Phase 2 で HRManager.calculateTeamCompatibility を正式に import
// ============================================
export function calculateTeamCompatibility(employees: any[]): number {
    if (!employees || employees.length < 2) return 1.0

    let compatibilityScore = 1.0

    for (let i = 0; i < employees.length; i++) {
        for (let j = i + 1; j < employees.length; j++) {
            const emp1 = employees[i]
            const emp2 = employees[j]

            if (!emp1.personalityKey || !emp2.personalityKey) continue

            const personality1 = PERSONALITIES[emp1.personalityKey]
            const personality2 = PERSONALITIES[emp2.personalityKey]

            if (!personality1 || !personality2) continue

            // 相性良い
            if (personality1.compatible && personality1.compatible.includes(emp2.personalityKey)) {
                compatibilityScore += 0.1
            }
            // 相性悪い
            if (personality1.incompatible && personality1.incompatible.includes(emp2.personalityKey)) {
                compatibilityScore -= 0.15
            }
        }
    }

    return Math.max(0.7, Math.min(1.3, compatibilityScore))
}

// ============================================
// マーケティング戦略定義
// ============================================
export const MARKETING_STRATEGIES: Record<string, MarketingStrategyConfig> = {
    'balanced': { share: 0.3, brand: 1.0, name: 'バランス型' },
    'brand': { share: 0.2, brand: 2.0, name: 'ブランド重視' },
    'share': { share: 0.5, brand: 0.5, name: 'シェア拡大重視' },
    'niche': { share: 0.1, brand: 1.5, name: 'ニッチ戦略' },
    'lowprice': { share: 0.6, brand: -0.3, name: '低価格戦略' }
}

// ============================================
// 製品開発ロジック
// ============================================
export function developProduct(): DevelopProductResult {
    const game = getGame()

    if (game.employees.length < 2) {
        return { success: false, message: '最低2名の従業員が必要です', bonusMessages: [] }
    }
    if (game.money < 2000000) {
        return { success: false, message: '資金不足です（200万円必要）', bonusMessages: [] }
    }

    game.money -= 2000000

    // チーム相性と特性・性格を考慮した品質計算
    const teamCompatibility = calculateTeamCompatibility(game.employees)
    const avgTech = game.employees.reduce((sum, emp) => sum + emp.abilities.technical, 0) / game.employees.length

    let qualityMultiplier = 1.0
    const bonusMessages: string[] = []

    // 完璧主義者で品質+20%
    const perfectionists = game.employees.filter(emp => emp.personalityKey === 'perfectionist')
    if (perfectionists.length > 0) {
        qualityMultiplier *= 1.2
        bonusMessages.push('完璧主義者がいて品質アップ！')
    }

    // 孤高の天才で能力+40%
    const geniuses = game.employees.filter(emp => emp.personalityKey === 'lone_genius')
    if (geniuses.length > 0) {
        qualityMultiplier *= 1.4
        bonusMessages.push('孤高の天才の力で大幅品質アップ！')
    }

    // アーキテクト特性
    const architects = game.employees.filter(emp => emp.subTraits && emp.subTraits.includes('architect'))
    if (architects.length > 0) {
        qualityMultiplier *= 1.5
        bonusMessages.push('アーキテクトの設計力で品質向上！')
    }

    // チーム相性を品質に反映
    qualityMultiplier *= teamCompatibility

    const baseQuality = Math.floor(50 + (avgTech / 2) + Math.random() * 20)
    const quality = Math.min(100, Math.floor(baseQuality * qualityMultiplier))

    const product = {
        id: Date.now(),
        name: `製品${game.products.length + 1}`,
        quality: quality,
        sales: 0
    }
    game.products.push(product)

    return {
        success: true,
        message: `${product.name}を開発しました！`,
        product,
        bonusMessages,
        teamCompatibility
    }
}

// ============================================
// マーケティング実行ロジック
// ============================================
export function executeMarketing(strategy: string): ExecuteMarketingResult {
    const game = getGame()
    const cost = 1000000

    game.money -= cost

    const selected = MARKETING_STRATEGIES[strategy] || MARKETING_STRATEGIES['balanced']

    game.marketShare = Math.min(15, game.marketShare + selected.share)
    game.brandPower = Math.max(0, Math.min(5, game.brandPower + selected.brand))

    return {
        success: true,
        message: `${selected.name}キャンペーンを実施しました！`,
        strategy: selected.name,
        shareChange: selected.share,
        brandChange: selected.brand,
        newMarketShare: game.marketShare,
        newBrandPower: game.brandPower
    }
}
