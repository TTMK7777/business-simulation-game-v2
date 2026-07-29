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

// a2ui-news-card は category バッジと別に headline (太字見出し) を表示するため、
// headline に本文と同じ文をそのまま入れると content と重複して二度読みになる。
// headline はカテゴリ由来の短いラベルに留め、実際の文面は content 側にのみ出す
const NEWS_ITEM_HEADLINE: Record<NewsItem['category'], string> = {
    industry: '🏭 業界ニュース',
    company: '🏢 企業ニュース',
    tech: '💻 テクノロジーニュース',
    economy: '📈 経済ニュース',
    policy: '📋 政策ニュース',
}

export function buildNewsItem(news: GeneratedNews, category: string): NewsItem {
    const a2uiCategory = mapGameNewsCategory(category)
    return {
        headline: NEWS_ITEM_HEADLINE[a2uiCategory],
        content: news.text,
        category: a2uiCategory,
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
        message: `資金が来月の固定費(人件費・利息・オフィス維持費 合計${Math.floor(monthlyCost / 10000)}万円)を下回りました。あと${Math.floor(shortfall / 10000)}万円不足しています。`,
        suggestions: [
            '銀行融資を検討する',
            '不採算製品を整理する',
            '採用を一時見合わせる',
        ],
    }
}

// ============================================
// Wave 1-B: 離職リスクの予兆 → アドバイザーカード
// ============================================
export interface AtRiskEmployeeLike {
    name: string
    motivation: number
}

/**
 * 退職予備軍のうち最もモチベーションが低い1名を取り上げて警告メッセージを組み立てる。
 * 予備軍が空なら null（＝カードを出さない）。
 */
export function buildRetentionAdvisorMessage(atRisk: AtRiskEmployeeLike[]): AdvisorMessage | null {
    if (atRisk.length === 0) return null

    const worst = atRisk.reduce((a, b) => (a.motivation <= b.motivation ? a : b))
    const others = atRisk.length - 1

    return {
        category: 'hr',
        sentiment: worst.motivation < 30 ? 'critical' : 'warning',
        message: `${worst.name}のモチベーションが${Math.round(worst.motivation)}まで低下しています${others > 0 ? `（他${others}名も低下中）` : ''}。このままだと退職のおそれがあります。`,
        suggestions: [
            '研修を実施してモチベーションを回復する',
            '製品数を絞って負荷（ストレス）を下げる',
            '昇進で処遇に応える',
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
    /** Wave 1-E: オフィス維持費（旧呼び出し互換のため任意） */
    fixedCost?: number
    /** Wave 1-B: 再採用コスト（旧呼び出し互換のため任意） */
    attritionCost?: number
    profit: number
    cash: number
    debt: number
}

export function buildFinanceSummaryData(input: MonthlySettlement): FinanceData {
    return {
        revenue: input.revenue,
        expenses: input.salaryTotal + input.interest + (input.fixedCost ?? 0) + (input.attritionCost ?? 0),
        profit: input.profit,
        cash: input.cash,
        debt: input.debt,
    }
}
