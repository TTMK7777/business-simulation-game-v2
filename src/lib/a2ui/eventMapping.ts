/**
 * a2ui 配線用の DOM 非依存な純粋関数群
 * (どのゲームイベントでどの a2ui カードを出すか / 出すべきかの判定・データ変換のみを担当。
 *  DOM・lit・A2UIManager には一切依存しないため、jsdom なしの vitest でテスト可能)
 */

import type { NewsItem, AdvisorMessage, FinanceData } from './manager'

// ============================================
// ニュースカテゴリのマッピング
// (MarketManager.NewsCategory: 'market'|'competitor'|'technology'|'economy'|'player'|'event')
// ============================================
const NEWS_CATEGORY_MAP: Record<string, NewsItem['category']> = {
    market: 'industry',
    competitor: 'company',
    technology: 'tech',
    economy: 'economy',
    player: 'company',
    event: 'industry',
}

export function mapGameNewsCategory(category: string): NewsItem['category'] {
    return NEWS_CATEGORY_MAP[category] ?? 'industry'
}

// ============================================
// 市況ニュース → NewsItem
// ============================================
export interface GeneratedNews {
    emoji: string
    text: string
    impact: NewsItem['impact']
}

export function buildNewsItem(news: GeneratedNews, category: string): NewsItem {
    return {
        headline: news.text,
        content: news.text,
        category: mapGameNewsCategory(category),
        impact: news.impact,
    }
}

// ============================================
// 競合攻撃 → NewsItem
// ============================================
export interface CompetitorAttackLike {
    actionType: 'poaching' | 'priceWar' | 'marketing' | 'partnership'
    actionName: string
    actionEmoji: string
    actionDescription: string
    competitor: { name: string }
    targetEmployeeName?: string
}

const ATTACK_IMPACT: Record<CompetitorAttackLike['actionType'], NewsItem['impact']> = {
    poaching: 'negative',
    priceWar: 'negative',
    marketing: 'negative',
    partnership: 'neutral',
}

export function buildCompetitorNewsItem(attack: CompetitorAttackLike): NewsItem {
    const description = attack.actionDescription.replace('${company}', attack.competitor.name)
    const target = attack.targetEmployeeName ? ` (対象: ${attack.targetEmployeeName}さん)` : ''
    return {
        headline: `${attack.actionEmoji} ${attack.competitor.name}: ${attack.actionName}`,
        content: `${description}${target}`,
        category: 'company',
        impact: ATTACK_IMPACT[attack.actionType],
    }
}

// ============================================
// 月次ニュースの選定 (競合攻撃があればそちらを優先。無ければ市況ニュース)
// ============================================
export function pickMonthlyNews(
    generated: GeneratedNews | null,
    category: string,
    attacks: CompetitorAttackLike[]
): NewsItem | null {
    if (attacks.length > 0) return buildCompetitorNewsItem(attacks[0])
    if (generated) return buildNewsItem(generated, category)
    return null
}

// ============================================
// 資金危険水域の判定 (renderers.ts の stat-danger と同じ考え方: 月間コストを下回ったら危険)
// ============================================
export function isFinanceDanger(cash: number, monthlyCost: number): boolean {
    return monthlyCost > 0 && cash < monthlyCost
}

// 「危険水域に新規突入した」瞬間だけ true (継続中の再通知を防ぐエッジ検出)
export function shouldFireDangerAdvisor(wasDanger: boolean, isDanger: boolean): boolean {
    return isDanger && !wasDanger
}

export function buildDangerAdvisorMessage(cash: number, monthlyCost: number): AdvisorMessage {
    const shortfall = Math.max(0, monthlyCost - cash)
    return {
        category: 'finance',
        sentiment: 'critical',
        message: `資金が来月の人件費・利息(合計${Math.floor(monthlyCost / 10000)}万円)を下回りました。あと${Math.floor(shortfall / 10000)}万円不足しています。`,
        suggestions: [
            '銀行融資を検討する',
            '不採算製品を整理する',
            '採用を一時見合わせる',
        ],
    }
}

// ============================================
// 月次決算 → FinanceData
// ============================================
export interface MonthlySettlement {
    revenue: number
    salaryTotal: number
    interest: number
    profit: number
    cash: number
    debt: number
}

export function buildFinanceSummaryData(input: MonthlySettlement): FinanceData {
    return {
        revenue: input.revenue,
        expenses: input.salaryTotal + input.interest,
        profit: input.profit,
        cash: input.cash,
        debt: input.debt,
    }
}
