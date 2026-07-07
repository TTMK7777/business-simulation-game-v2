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
} from '../lib/managers/TheoryManager'
import { THEORY_LIST, THEORIES, THEORY_CATEGORIES } from '../lib/config/theories'

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
