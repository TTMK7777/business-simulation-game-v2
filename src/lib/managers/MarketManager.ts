// ビジネスエンパイア 2.0 - 市場・競合管理
// game.ts:1691-1898 から抽出（純粋ロジック、DOM操作なし）

import { getGame, getCompetitors, resetCompetitors as storeResetCompetitors } from '../store/gameStore'
import {
    DIFFICULTY_SETTINGS,
    COMPETITOR_STRATEGIES,
    NEWS_TEMPLATES,
    COMPETITOR_ACTIONS,
    BALANCE_CONFIG,
    DEBUG_CONFIG,
    debugLog,
    legacyNewsTemplates,
    type CompetitorConfig
} from '../gameConfig'

// ============================================
// 競合攻撃結果型
// ============================================
export interface CompetitorAttackResult {
    competitor: CompetitorConfig
    actionType: string
    actionName: string
    actionEmoji: string
    actionDescription: string
    targetEmployeeName?: string
}

export interface RankingEntry {
    name: string
    share: number
    isPlayer?: boolean
}

// ============================================
// ニュース生成（DOM操作なし、文字列を返す）
// ============================================
export function generateNews(forceCategory?: string): { emoji: string; text: string } | null {
    const game = getGame()
    const competitors = getCompetitors()
    const difficultyConfig = DIFFICULTY_SETTINGS[game.difficulty || 'normal']

    // 条件に合うニューステンプレートをフィルタリング
    const eligibleNews = NEWS_TEMPLATES.filter(news => {
        if (news.conditions) {
            if (news.conditions.minPlayerShare && game.marketShare < news.conditions.minPlayerShare) return false
            if (news.conditions.maxPlayerShare && game.marketShare > news.conditions.maxPlayerShare) return false
            if (news.conditions.minTurn && game.turn < news.conditions.minTurn) return false
        }
        // カテゴリ指定がある場合はフィルタ
        if (forceCategory && news.category !== forceCategory) return false
        // 同じカテゴリが連続しないようにする
        if (!forceCategory && news.category === game.lastNewsCategory && Math.random() > 0.3) return false
        return true
    })

    // ニュースがない場合はレガシーテンプレートを使用
    if (eligibleNews.length === 0) {
        const template = legacyNewsTemplates[Math.floor(Math.random() * legacyNewsTemplates.length)]
        const company = competitors[Math.floor(Math.random() * competitors.length)].name
        const percent = Math.floor(Math.random() * 30) + 10
        const news = template.replace('${company}', company).replace('${percent}', String(percent))
        return { emoji: '\u{1F4F0}', text: news }
    }

    // ランダムにニュースを選択
    const selectedNews = eligibleNews[Math.floor(Math.random() * eligibleNews.length)]
    game.lastNewsCategory = selectedNews.category

    // テンプレート変数を置換
    const company = competitors[Math.floor(Math.random() * competitors.length)].name
    const percent = Math.floor(Math.random() * 30) + 10
    const newsText = selectedNews.template
        .replace('${company}', company)
        .replace('${percent}', String(percent))

    return { emoji: selectedNews.emoji, text: newsText }
}

// ============================================
// 競合AI企業の動的化（警戒モード＆攻撃アクション）
// ============================================
export function updateCompetitors(): CompetitorAttackResult[] {
    const game = getGame()
    const competitors = getCompetitors()
    const attackResults: CompetitorAttackResult[] = []

    // デバッグモードで競合攻撃を無効化
    if (DEBUG_CONFIG.noCompetitorAttacks) {
        debugLog('competitor', '競合攻撃は無効化されています')
        return attackResults
    }

    const difficultyConfig = DIFFICULTY_SETTINGS[game.difficulty || 'normal']
    const difficultyMultiplier = BALANCE_CONFIG.difficultyMultipliers[game.difficulty || 'normal']
    const aggressiveness = difficultyConfig.competitorAggressiveness * difficultyMultiplier.competitorStrength

    competitors.forEach(comp => {
        const strategyConfig = COMPETITOR_STRATEGIES[comp.strategy]

        // 警戒レベルの更新（プレイヤーの成長に応じて上昇）
        if (game.marketShare > 5) {
            comp.alertLevel = Math.min(100, comp.alertLevel + (game.marketShare * 0.5))
        }
        if (game.marketShare > 15) {
            comp.alertLevel = Math.min(100, comp.alertLevel + 5)
        }

        // クールダウン減少
        if (comp.actionCooldown > 0) {
            comp.actionCooldown--
        }

        // 競合からの攻撃アクション（警戒レベルが高い場合）
        if (comp.alertLevel > 50 && comp.actionCooldown === 0 && Math.random() < 0.3 * aggressiveness) {
            const result = executeCompetitorAction(comp)
            if (result) {
                attackResults.push(result)
            }
        }

        debugLog('competitor', `${comp.name}の状態`, {
            alertLevel: comp.alertLevel,
            cooldown: comp.actionCooldown,
            share: comp.share ?? comp.initialShare
        })

        // シェア変動（戦略に応じて）
        const shareChange = (Math.random() * 2 - 0.5) * strategyConfig.shareGrowthRate * aggressiveness
        const currentShare = comp.share ?? comp.initialShare
        comp.share = Math.max(5, Math.min(60, currentShare + shareChange))

        // 競合のシェアが高すぎる場合、プレイヤーに影響
        if (comp.share > 40) {
            game.marketShare = Math.max(0.1, game.marketShare - 0.2 * aggressiveness)
            if (game.brandPower > 1) {
                game.brandPower--
            }
        }

        // パワー更新
        if (comp.strategy === 'aggressive' && game.marketShare > 5) {
            comp.power += 3 * aggressiveness
        }
    })

    return attackResults
}

// ============================================
// 競合からの攻撃アクション実行
// ============================================
export function executeCompetitorAction(comp: CompetitorConfig): CompetitorAttackResult | null {
    const game = getGame()
    const strategyConfig = COMPETITOR_STRATEGIES[comp.strategy]
    const difficultyConfig = DIFFICULTY_SETTINGS[game.difficulty || 'normal']

    // アクションの種類を決定
    const rand = Math.random()
    let actionType: keyof typeof COMPETITOR_ACTIONS

    if (rand < strategyConfig.poachingChance) {
        actionType = 'poaching'
    } else if (rand < strategyConfig.poachingChance + strategyConfig.priceWarChance) {
        actionType = 'priceWar'
    } else if (rand < strategyConfig.poachingChance + strategyConfig.priceWarChance + strategyConfig.marketingChance) {
        actionType = 'marketing'
    } else {
        actionType = 'partnership'
    }

    const action = COMPETITOR_ACTIONS[actionType]
    comp.lastAction = actionType
    comp.actionCooldown = 3 // 3ターンのクールダウン

    let result: CompetitorAttackResult | null = null

    // アクションの効果を適用
    switch (actionType) {
        case 'poaching':
            // 引き抜き攻勢 - 従業員のモチベーション低下リスク
            if (game.employees.length > 0 && Math.random() < difficultyConfig.poachingRisk) {
                const targetEmployee = game.employees[Math.floor(Math.random() * game.employees.length)]
                if (targetEmployee.motivation) {
                    targetEmployee.motivation = Math.max(30, targetEmployee.motivation - 15)
                }
                result = {
                    competitor: comp,
                    actionType,
                    actionName: action.name,
                    actionEmoji: action.emoji,
                    actionDescription: action.description,
                    targetEmployeeName: targetEmployee.name
                }
            }
            break
        case 'priceWar':
            // 価格競争 - 市場シェアに影響
            game.marketShare = Math.max(0.1, game.marketShare - 0.5)
            result = {
                competitor: comp,
                actionType,
                actionName: action.name,
                actionEmoji: action.emoji,
                actionDescription: action.description
            }
            break
        case 'marketing':
            // マーケティング攻勢 - ブランド力に影響
            if (game.brandPower > 1) {
                game.brandPower = Math.max(1, game.brandPower - 2)
            }
            result = {
                competitor: comp,
                actionType,
                actionName: action.name,
                actionEmoji: action.emoji,
                actionDescription: action.description
            }
            break
        case 'partnership':
            // 提携戦略 - 競合のシェア増加
            const currentShare = comp.share ?? comp.initialShare
            comp.share = Math.min(60, currentShare + 3)
            // partnership の場合は generateNews('competitor') を呼ぶ代わりに結果を返す
            result = {
                competitor: comp,
                actionType,
                actionName: action.name,
                actionEmoji: action.emoji,
                actionDescription: action.description
            }
            break
    }

    // 攻撃履歴に追加
    if (result) {
        if (!game.competitorAttacks) game.competitorAttacks = []
        game.competitorAttacks.push(`${comp.name}: ${action.name}`)
        if (game.competitorAttacks.length > 5) {
            game.competitorAttacks.shift()
        }
    }

    return result
}

// ============================================
// 競合リセット
// ============================================
export function resetCompetitors(): void {
    storeResetCompetitors()
}

// ============================================
// ランキング計算（DOM更新は除外）
// ============================================
export function calculateRanking(): RankingEntry[] {
    const game = getGame()
    const competitors = getCompetitors()

    const allCompanies: RankingEntry[] = [
        ...competitors.map(c => ({ name: c.name, share: c.share ?? c.initialShare })),
        { name: 'あなた', share: game.marketShare, isPlayer: true }
    ].sort((a, b) => b.share - a.share)

    return allCompanies
}
