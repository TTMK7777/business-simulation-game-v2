/**
 * 経営理論図鑑 Phase A のユニットテスト
 *
 * テスト対象 (DOM 非依存の純ロジック):
 * - TheoryManager: 条件評価 / 解禁記録 / 重複解禁防止 / 旧セーブ自己修復 / 進捗
 * - config/theories.ts: 定義の整合性 (id 一致・必須フィールド・condition 型)
 *
 * UI 層 (theoryCodex.ts の toast / モーダル) は実ブラウザ E2E で検証する
 * (coachmark.test.ts と同じ方針: jsdom 依存を持ち込まない)。
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { resetGameState, getGame } from '../lib/store/gameStore'
import {
    checkTheoryCondition,
    checkTheories,
    getTheoriesList,
    getTheoryProgress,
    getTheoryTagForDocument,
} from '../lib/managers/TheoryManager'
import { processVerdict } from '../lib/managers/DocumentManager'
import {
    THEORY_LIST, THEORIES, THEORY_CATEGORIES,
    DOCUMENT_CATEGORY_THEORY_RULES, DOCUMENT_NATURE_THEORY_RULES, INVESTIGATED_THEORY_RULE,
} from '../lib/config/theories'

function makeEmployee(salary = 400000): any {
    return {
        id: Math.floor(Math.random() * 100000),
        name: 'テスト社員',
        salary,
        motivation: 50,
        abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
        department: 'development',
        position: 'staff',
    }
}

describe('theories 定義の整合性', () => {
    it('THEORIES マップと THEORY_LIST の id が一致する', () => {
        expect(Object.keys(THEORIES).length).toBe(THEORY_LIST.length)
        THEORY_LIST.forEach(t => {
            expect(THEORIES[t.id]).toBe(t)
        })
    })

    it('id が重複していない', () => {
        const ids = THEORY_LIST.map(t => t.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('全理論が必須フィールドを持つ (空文字なし)', () => {
        THEORY_LIST.forEach(t => {
            expect(t.name.length).toBeGreaterThan(0)
            expect(t.tagline.length).toBeGreaterThan(0)
            expect(t.summary.length).toBeGreaterThan(0)
            expect(t.example.length).toBeGreaterThan(0)
            expect(t.gameHint.length).toBeGreaterThan(0)
            expect(t.unlockMessage.length).toBeGreaterThan(0)
            expect(t.hintText.length).toBeGreaterThan(0)
            expect(THEORY_CATEGORIES[t.category]).toBeDefined()
            expect(t.condition.value).toBeGreaterThan(0)
        })
    })

    it('summary は読ませすぎ防止の文字数上限内 (120字)', () => {
        THEORY_LIST.forEach(t => {
            expect(t.summary.length).toBeLessThanOrEqual(120)
        })
    })
})

describe('checkTheoryCondition', () => {
    beforeEach(() => {
        resetGameState()
    })

    it('products: 製品数が閾値以上で true', () => {
        const game = getGame()
        expect(checkTheoryCondition({ type: 'products', value: 2 })).toBe(false)
        game.products.push({ name: 'A', quality: 50, sales: 0 } as any)
        game.products.push({ name: 'B', quality: 50, sales: 0 } as any)
        expect(checkTheoryCondition({ type: 'products', value: 2 })).toBe(true)
    })

    it('employees: 従業員数が閾値以上で true', () => {
        const game = getGame()
        expect(checkTheoryCondition({ type: 'employees', value: 3 })).toBe(false)
        game.employees.push(makeEmployee(), makeEmployee(), makeEmployee())
        expect(checkTheoryCondition({ type: 'employees', value: 3 })).toBe(true)
    })

    it('marketShare / brandPower / turn: 閾値以上で true', () => {
        const game = getGame()
        game.marketShare = 5
        game.brandPower = 30
        game.turn = 2
        expect(checkTheoryCondition({ type: 'marketShare', value: 5 })).toBe(true)
        expect(checkTheoryCondition({ type: 'brandPower', value: 30 })).toBe(true)
        expect(checkTheoryCondition({ type: 'turn', value: 2 })).toBe(true)
        expect(checkTheoryCondition({ type: 'turn', value: 3 })).toBe(false)
    })

    it('money_low: 資金が閾値以下で true (下回り型)', () => {
        const game = getGame()
        game.money = 10000000
        expect(checkTheoryCondition({ type: 'money_low', value: 3000000 })).toBe(false)
        game.money = 2999999
        expect(checkTheoryCondition({ type: 'money_low', value: 3000000 })).toBe(true)
    })

    it('monthly_profit: 売上ゼロの開始直後は黒字と誤判定しない', () => {
        const game = getGame()
        // monthlyRevenue=0, 従業員なし → 0-0=0 だが売上ゼロなので false
        expect(checkTheoryCondition({ type: 'monthly_profit', value: 1 })).toBe(false)
        // 売上 100万 / 人件費 40万 → 黒字 60万
        game.monthlyRevenue = 1000000
        game.employees.push(makeEmployee(400000))
        expect(checkTheoryCondition({ type: 'monthly_profit', value: 1 })).toBe(true)
        // 人件費が売上を超える → false
        game.employees.push(makeEmployee(700000))
        expect(checkTheoryCondition({ type: 'monthly_profit', value: 1 })).toBe(false)
    })

    it('total_sales: 全製品の累計売上合計で判定', () => {
        const game = getGame()
        game.products.push({ name: 'A', quality: 50, sales: 20000000 } as any)
        expect(checkTheoryCondition({ type: 'total_sales', value: 30000000 })).toBe(false)
        game.products.push({ name: 'B', quality: 50, sales: 10000000 } as any)
        expect(checkTheoryCondition({ type: 'total_sales', value: 30000000 })).toBe(true)
    })
})

describe('checkTheories (解禁記録)', () => {
    beforeEach(() => {
        resetGameState()
    })

    it('条件を満たした理論だけを新規解禁として返し、unlockedTheories に積む', () => {
        const game = getGame()
        game.turn = 2 // swot のみ該当
        const newly = checkTheories()
        expect(newly.map(t => t.id)).toEqual(['swot'])
        expect(game.unlockedTheories).toContain('swot')
    })

    it('解禁済みの理論は再度返さない (toast の重複発火防止)', () => {
        const game = getGame()
        game.turn = 2
        expect(checkTheories().length).toBe(1)
        expect(checkTheories().length).toBe(0)
        expect(game.unlockedTheories.filter(id => id === 'swot').length).toBe(1)
    })

    it('複数条件の同時成立で複数解禁される', () => {
        const game = getGame()
        game.turn = 2
        game.employees.push(makeEmployee(), makeEmployee(), makeEmployee())
        const ids = checkTheories().map(t => t.id)
        expect(ids).toContain('swot')
        expect(ids).toContain('herzberg')
    })

    it('旧セーブ (unlockedTheories 未定義) でも自己修復して動く', () => {
        const game = getGame()
        delete (game as any).unlockedTheories
        game.turn = 2
        const newly = checkTheories()
        expect(newly.map(t => t.id)).toEqual(['swot'])
        expect(Array.isArray(game.unlockedTheories)).toBe(true)
    })
})

describe('getTheoriesList / getTheoryProgress', () => {
    beforeEach(() => {
        resetGameState()
    })

    it('一覧は全理論を返し、unlocked フラグが反映される', () => {
        const game = getGame()
        game.unlockedTheories.push('ppm')
        const list = getTheoriesList()
        expect(list.length).toBe(THEORY_LIST.length)
        expect(list.find(t => t.id === 'ppm')?.unlocked).toBe(true)
        expect(list.find(t => t.id === 'swot')?.unlocked).toBe(false)
    })

    it('進捗は解禁数と割合を返す (未知 id は数えない)', () => {
        const game = getGame()
        game.unlockedTheories.push('swot', 'ppm', 'deleted_theory_id')
        const progress = getTheoryProgress()
        expect(progress.unlocked).toBe(2)
        expect(progress.total).toBe(THEORY_LIST.length)
        expect(progress.percentage).toBe(Math.round((2 / THEORY_LIST.length) * 100))
    })
})

// ============================================
// Phase B: CEO 決裁 → 理論タグ
// ============================================

describe('getTheoryTagForDocument (Phase B タグ解決)', () => {
    it('調査済み書類は nature/カテゴリより優先してサンクコスト', () => {
        const tag = getTheoryTagForDocument({
            nature: 'gamble', category: 'marketing',
            investigationResult: '調査の結果、成功確率は約40%と推定されます。',
        })
        expect(tag?.theoryId).toBe('sunk_cost')
    })

    it('nature ルール: gamble→期待値 / tradeoff→機会費用 / long_term→両利き', () => {
        expect(getTheoryTagForDocument({ nature: 'gamble', category: 'budget' })?.theoryId).toBe('expected_value')
        expect(getTheoryTagForDocument({ nature: 'tradeoff', category: 'budget' })?.theoryId).toBe('opportunity_cost')
        expect(getTheoryTagForDocument({ nature: 'long_term', category: 'budget' })?.theoryId).toBe('ambidexterity')
    })

    it('nature が clear_good/clear_bad ならカテゴリルールにフォールバック', () => {
        expect(getTheoryTagForDocument({ nature: 'clear_good', category: 'hiring' })?.theoryId).toBe('herzberg')
        expect(getTheoryTagForDocument({ nature: 'clear_bad', category: 'marketing' })?.theoryId).toBe('brand_equity')
    })

    it('該当ルールなしは null (無理にタグ付けしない)', () => {
        expect(getTheoryTagForDocument({ nature: 'clear_good', category: 'unknown_cat' })).toBeNull()
        expect(getTheoryTagForDocument({})).toBeNull()
    })

    it('全 12 書類カテゴリにルールがあり、参照先理論が実在する', () => {
        const categories = [
            'hiring', 'budget', 'product_plan', 'marketing', 'equipment',
            'personnel_change', 'promotion', 'training', 'salary_raise',
            'new_business', 'cost_cut', 'partnership',
        ]
        categories.forEach(c => {
            const rule = DOCUMENT_CATEGORY_THEORY_RULES[c]
            expect(rule, `カテゴリ ${c} のルールが未定義`).toBeDefined()
            expect(THEORIES[rule.theoryId], `カテゴリ ${c} の理論 ${rule.theoryId} が図鑑に不在`).toBeDefined()
            expect(rule.lesson.length).toBeGreaterThan(0)
        })
        Object.values(DOCUMENT_NATURE_THEORY_RULES).forEach(rule => {
            expect(THEORIES[rule.theoryId]).toBeDefined()
        })
        expect(THEORIES[INVESTIGATED_THEORY_RULE.theoryId]).toBeDefined()
    })
})

describe('processVerdict の理論タグ付与と図鑑解禁 (Phase B 統合)', () => {
    function makeCeoState(overrides: Record<string, unknown> = {}): any {
        return {
            turn: 1, month: 1, money: 10_000_000,
            employees: [], products: [], marketShare: 5, brandPower: 50,
            difficulty: 'normal',
            ceo: {
                approvalRating: 50, remandsThisWeek: 0, investigationBudget: 0,
                trapsDetected: 0, trapsMissed: 0,
                decisionsCorrect: 0, decisionsWrong: 0, gamblesRejected: 0,
            },
            documentQueue: [], documentHistory: [],
            documentStats: { totalProcessed: 0, totalApproved: 0, totalRejected: 0, trapsDetected: 0, trapsMissed: 0 },
            scandalRisk: 0,
            unlockedTheories: [],
            ...overrides,
        }
    }

    function makeDoc(overrides: Record<string, unknown> = {}): any {
        return {
            id: 'doc_test_1', category: 'marketing', priority: 'normal',
            title: 'テスト稟議', department: '営業',
            submitter: { employeeId: null, name: '田中 太郎', position: '課長' },
            summary: 'テスト', nature: 'clear_good', trap: null, clues: [],
            details: { amount: 500_000, expectedBenefit: 'テスト効果', timeline: '1ヶ月', risks: 'なし', attachments: [] },
            actualBenefit: 60, turnSubmitted: 1, deadline: null,
            verdict: null, resultApplied: false, underInvestigation: false,
            ...overrides,
        }
    }

    it('承認時に theoryTag が付与され、図鑑に解禁される (newlyUnlocked=true)', () => {
        const state = makeCeoState()
        state.documentQueue.push(makeDoc())
        const outcome = processVerdict(state, 'doc_test_1', 'approve')
        expect(outcome?.theoryTag?.theoryId).toBe('brand_equity')
        expect(outcome?.theoryTag?.newlyUnlocked).toBe(true)
        expect(outcome?.theoryTag?.lesson.length).toBeGreaterThan(0)
        expect(state.unlockedTheories).toContain('brand_equity')
    })

    it('同じ理論の 2 度目の決裁は newlyUnlocked=false (二重解禁しない)', () => {
        const state = makeCeoState()
        state.documentQueue.push(makeDoc({ id: 'doc_a' }), makeDoc({ id: 'doc_b' }))
        processVerdict(state, 'doc_a', 'approve')
        const second = processVerdict(state, 'doc_b', 'reject')
        expect(second?.theoryTag?.theoryId).toBe('brand_equity')
        expect(second?.theoryTag?.newlyUnlocked).toBe(false)
        expect(state.unlockedTheories.filter((id: string) => id === 'brand_equity').length).toBe(1)
    })

    it('保留 (hold) では theoryTag を付与しない (決裁のみが学習機会)', () => {
        const state = makeCeoState()
        state.documentQueue.push(makeDoc())
        const outcome = processVerdict(state, 'doc_test_1', 'hold')
        expect(outcome?.theoryTag).toBeUndefined()
        expect(state.unlockedTheories.length).toBe(0)
    })

    it('unlockedTheories 未定義の旧セーブでも自己修復する', () => {
        const state = makeCeoState()
        delete state.unlockedTheories
        state.documentQueue.push(makeDoc({ nature: 'gamble' }))
        const outcome = processVerdict(state, 'doc_test_1', 'reject')
        expect(outcome?.theoryTag?.theoryId).toBe('expected_value')
        expect(state.unlockedTheories).toContain('expected_value')
    })
})

describe('event 型条件 (Phase B)', () => {
    beforeEach(() => {
        resetGameState()
    })

    it('event 型理論は状態評価 (checkTheories) では解禁されない', () => {
        const game = getGame()
        // 全状態を最大化しても event 型は解禁されない
        game.turn = 999
        game.marketShare = 60
        game.brandPower = 100
        const unlockedIds = checkTheories().map(t => t.id)
        expect(unlockedIds).not.toContain('opportunity_cost')
        expect(unlockedIds).not.toContain('expected_value')
        expect(unlockedIds).not.toContain('sunk_cost')
        expect(checkTheoryCondition({ type: 'event', value: 1 })).toBe(false)
    })
})
