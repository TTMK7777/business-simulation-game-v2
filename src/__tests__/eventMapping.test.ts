/**
 * a2ui 配線: 発火条件ロジックのユニットテスト
 *
 * テスト対象 (DOM 非依存の純ロジック): src/lib/a2ui/eventMapping.ts
 * UI 層 (a2ui/manager.ts の実際のカード描画) は実ブラウザ E2E で検証する
 * (coachmark.test.ts / theory.test.ts と同じ方針: jsdom 依存を持ち込まない)。
 */

import { describe, it, expect } from 'vitest'
import {
    mapGameNewsCategory,
    buildNewsItem,
    buildCompetitorNewsItem,
    pickMonthlyNews,
    isFinanceDanger,
    shouldFireDangerAdvisor,
    buildDangerAdvisorMessage,
    buildFinanceSummaryData,
    type CompetitorAttackLike,
} from '../lib/a2ui/eventMapping'

function makeAttack(overrides: Partial<CompetitorAttackLike> = {}): CompetitorAttackLike {
    return {
        actionType: 'poaching',
        actionName: '引き抜き攻勢',
        actionEmoji: '🎯',
        actionDescription: '${company}が引き抜きを仕掛けてきた！',
        competitor: { name: 'ライバル商事' },
        ...overrides,
    }
}

describe('mapGameNewsCategory', () => {
    it('既知のカテゴリを a2ui の NewsItem カテゴリへマッピングする', () => {
        expect(mapGameNewsCategory('market')).toBe('industry')
        expect(mapGameNewsCategory('competitor')).toBe('company')
        expect(mapGameNewsCategory('technology')).toBe('tech')
        expect(mapGameNewsCategory('economy')).toBe('economy')
        expect(mapGameNewsCategory('player')).toBe('company')
        expect(mapGameNewsCategory('event')).toBe('industry')
    })

    it('未知のカテゴリは industry にフォールバックする', () => {
        expect(mapGameNewsCategory('')).toBe('industry')
        expect(mapGameNewsCategory('unknown')).toBe('industry')
    })
})

describe('buildNewsItem', () => {
    it('市況ニュースを NewsItem に変換する', () => {
        const item = buildNewsItem({ emoji: '📈', text: 'IT業界に追い風！', impact: 'positive' }, 'market')
        expect(item.headline).toBe('IT業界に追い風！')
        expect(item.content).toBe('IT業界に追い風！')
        expect(item.category).toBe('industry')
        expect(item.impact).toBe('positive')
    })

    it('generateNews() の impact をそのまま NewsItem に引き継ぐ', () => {
        expect(buildNewsItem({ emoji: '📉', text: '景気減速', impact: 'negative' }, 'market').impact).toBe('negative')
        expect(buildNewsItem({ emoji: '🔥', text: 'ブーム到来', impact: 'neutral' }, 'market').impact).toBe('neutral')
    })
})

describe('buildCompetitorNewsItem', () => {
    it('${company} プレースホルダを競合名に置換する', () => {
        const item = buildCompetitorNewsItem(makeAttack())
        expect(item.content).toContain('ライバル商事が引き抜きを仕掛けてきた！')
        expect(item.headline).toBe('🎯 ライバル商事: 引き抜き攻勢')
        expect(item.category).toBe('company')
    })

    it('targetEmployeeName があれば本文に対象者名を付記する', () => {
        const item = buildCompetitorNewsItem(makeAttack({ targetEmployeeName: '山田太郎' }))
        expect(item.content).toContain('対象: 山田太郎さん')
    })

    it('targetEmployeeName が無ければ対象者表記を付けない', () => {
        const item = buildCompetitorNewsItem(makeAttack())
        expect(item.content).not.toContain('対象:')
    })

    it.each([
        ['poaching', 'negative'],
        ['priceWar', 'negative'],
        ['marketing', 'negative'],
        ['partnership', 'neutral'],
    ] as const)('actionType=%s の impact は %s', (actionType, expected) => {
        const item = buildCompetitorNewsItem(makeAttack({ actionType }))
        expect(item.impact).toBe(expected)
    })
})

describe('pickMonthlyNews', () => {
    it('競合攻撃があれば市況ニュースより優先する', () => {
        const generated = { emoji: '📈', text: '市況ニュース', impact: 'positive' as const }
        const attacks = [makeAttack()]
        const result = pickMonthlyNews(generated, 'market', attacks)
        expect(result?.headline).toContain('ライバル商事')
    })

    it('競合攻撃が無ければ市況ニュースを使う', () => {
        const generated = { emoji: '📈', text: '市況ニュース', impact: 'positive' as const }
        const result = pickMonthlyNews(generated, 'market', [])
        expect(result?.headline).toBe('市況ニュース')
    })

    it('複数の競合攻撃がある場合は先頭を採用する', () => {
        const attacks = [
            makeAttack({ competitor: { name: 'A社' } }),
            makeAttack({ competitor: { name: 'B社' } }),
        ]
        const result = pickMonthlyNews(null, 'market', attacks)
        expect(result?.headline).toContain('A社')
    })

    it('どちらも無ければ null を返す', () => {
        expect(pickMonthlyNews(null, 'market', [])).toBeNull()
    })
})

describe('isFinanceDanger', () => {
    it('現金が月間コストを下回れば危険', () => {
        expect(isFinanceDanger(500_000, 1_000_000)).toBe(true)
    })

    it('現金が月間コスト以上なら安全', () => {
        expect(isFinanceDanger(1_000_000, 1_000_000)).toBe(false)
        expect(isFinanceDanger(2_000_000, 1_000_000)).toBe(false)
    })

    it('月間コストが0以下なら常に安全 (従業員も借入も無い状態)', () => {
        expect(isFinanceDanger(-100, 0)).toBe(false)
    })
})

describe('shouldFireDangerAdvisor', () => {
    it('危険水域への新規突入時のみ true', () => {
        expect(shouldFireDangerAdvisor(false, true)).toBe(true)
    })

    it('継続して危険水域にいる場合は再発火しない', () => {
        expect(shouldFireDangerAdvisor(true, true)).toBe(false)
    })

    it('危険水域でない場合は発火しない', () => {
        expect(shouldFireDangerAdvisor(false, false)).toBe(false)
        expect(shouldFireDangerAdvisor(true, false)).toBe(false)
    })
})

describe('buildDangerAdvisorMessage', () => {
    it('sentiment/category が固定で、不足額がメッセージに含まれる', () => {
        const msg = buildDangerAdvisorMessage(500_000, 1_000_000)
        expect(msg.category).toBe('finance')
        expect(msg.sentiment).toBe('critical')
        expect(msg.message).toContain('50万円不足')
        expect(msg.suggestions?.length).toBeGreaterThan(0)
    })

    it('不足額はマイナスにならない (下振れしても0未満は表示しない)', () => {
        const msg = buildDangerAdvisorMessage(2_000_000, 1_000_000)
        expect(msg.message).toContain('0万円不足')
    })
})

describe('buildFinanceSummaryData', () => {
    it('expenses は salaryTotal + interest の合算になる', () => {
        const data = buildFinanceSummaryData({
            revenue: 5_000_000,
            salaryTotal: 2_000_000,
            interest: 100_000,
            profit: 2_900_000,
            cash: 12_000_000,
            debt: 5_000_000,
        })
        expect(data.expenses).toBe(2_100_000)
        expect(data.revenue).toBe(5_000_000)
        expect(data.profit).toBe(2_900_000)
        expect(data.cash).toBe(12_000_000)
        expect(data.debt).toBe(5_000_000)
    })
})
