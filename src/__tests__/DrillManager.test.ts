/**
 * DrillManager.ts のユニットテスト（経営力ドリル 垂直スライス）
 *
 * このテストで確かめたいのは「問題が作れること」ではなく、
 * **罠の数値がゲームエンジンの実際の中間計算値と一致していること**。
 *
 * ここが成り立つなら、罠を人力で列挙する必要がなくなる = コンテンツ生産の
 * ボトルネックが外れる。統合構想が成立するかどうかの分かれ目はここ1点。
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
    generateProblemsFromSnapshot,
    generateDrill,
    judgeAnswer,
    DRILL_TOLERANCE_RATIO,
} from '../lib/managers/DrillManager'
import { DRAWERS, DRAWER_KEYS } from '../lib/config/drawers'
import { calculateMonthlyRevenue } from '../lib/managers/FinanceManager'
import { getGame, resetGameState } from '../lib/store/gameStore'
import type { FinanceSnapshot } from '../lib/types/index'

beforeEach(() => {
    resetGameState()
})

/** 決定的なテスト用スナップショット（数字はすべて手計算できる値にしてある） */
function makeSnapshot(overrides: Partial<FinanceSnapshot> = {}): FinanceSnapshot {
    const revenue = 5_000_000
    // 限界利益率がちょうど 60% になる値。損益分岐点が固定費合計と明確に食い違う
    const variableCost = 2_000_000
    const salaryTotal = 2_000_000
    const interest = 100_000
    const fixedCost = 800_000
    const attritionCost = 300_000
    const profit = revenue - variableCost - salaryTotal - interest - fixedCost - attritionCost // -200,000
    return {
        turn: 12,
        year: 2025,
        month: 12,
        revenue,
        variableCost,
        salaryTotal,
        interest,
        fixedCost,
        attritionCost,
        profit,
        cash: 8_000_000,
        debt: 3_000_000,
        netWorth: 5_000_000,
        operatingCF: profit,
        financingCF: 0,
        revenueDrivers: { contributions: [], total: revenue },
        ...overrides,
    }
}

// ============================================================
// 生成そのもの
// ============================================================
describe('generateProblemsFromSnapshot', () => {
    it('1つの決算から複数の問題が生成される', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot())

        expect(problems.length).toBeGreaterThanOrEqual(3)
    })

    it('問題文に決算の年月が入る（自分の会社の話だと分かる）', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot({ year: 2027, month: 3 }))

        for (const p of problems) {
            expect(p.stem).toContain('2027年3月')
            expect(p.source.year).toBe(2027)
            expect(p.source.month).toBe(3)
        }
    })

    it('各問題は引き出し選択肢を4つ持ち、正解の引き出しを必ず含む', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot())

        for (const p of problems) {
            expect(p.drawerChoices).toHaveLength(4)
            expect(p.drawerChoices).toContain(p.drawer)
            // 重複した選択肢を出さない
            expect(new Set(p.drawerChoices).size).toBe(4)
            for (const c of p.drawerChoices) {
                expect(DRAWER_KEYS).toContain(c)
            }
        }
    })

    it('id は決算ごとに一意（同じ月の問題が二重登録されない）', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot())
        const ids = problems.map(p => p.id)

        expect(new Set(ids).size).toBe(ids.length)
    })
})

// ============================================================
// 本丸: 罠がエンジンの中間値と一致するか
// ============================================================
describe('罠の数値がエンジンの中間計算値と一致する', () => {
    it('利益を問う問題の罠は、profit の計算を途中で止めた値になっている', () => {
        const snap = makeSnapshot()
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'profit')!

        expect(problem.answer).toBe(snap.profit)

        const trapValues = problem.traps.map(t => t.value)
        // FinanceManager の profit =
        //   revenue - variableCost - salaryTotal - interest - fixedCost - attritionCost
        // その減算チェーンを途中で止めた値が、そのまま罠になっていること
        const contributionMargin = snap.revenue - snap.variableCost
        expect(trapValues).toContain(snap.revenue)
        expect(trapValues).toContain(contributionMargin)
        expect(trapValues).toContain(contributionMargin - snap.salaryTotal)
        expect(trapValues).toContain(contributionMargin - snap.salaryTotal - snap.interest)
        expect(trapValues).toContain(
            contributionMargin - snap.salaryTotal - snap.interest - snap.fixedCost
        )
        // 変動費だけを引き忘れた値（固定費は全部引けているのに利益が変動費のぶん過大になる）
        expect(trapValues).toContain(snap.profit + snap.variableCost)
    })

    it('罠は正解と重複しない（完走した値を罠と判定しない）', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot())

        for (const p of problems) {
            for (const t of p.traps) {
                expect(t.value).not.toBe(p.answer)
            }
        }
    })

    // 2026-08-01 実データで発覚: ゲーム由来の数値は割り切れないため、罠が正解に
    // 偶然接近する（自己資本比率 50.02% vs 他人資本比率 49.98%、損益分岐点 2,840,000 vs
    // 実売上 2,844,628）。除外基準を採点の許容誤差と揃えないと判定が反転する。
    it('残った罠は必ず trap と判定される（正解に紛れる罠を残さない）', () => {
        const snapshots = [
            makeSnapshot(),
            // 自己資本比率と他人資本比率がほぼ50%で衝突するケース
            makeSnapshot({ cash: 10_004_628, debt: 5_000_000, netWorth: 5_004_628 }),
            // 損益分岐点と実売上が僅差で衝突するケース。
            // variableCost=0 は変動費導入前の旧セーブ相当（限界利益率100%）でもあり、
            // このとき損益分岐点は固定費合計に一致する
            makeSnapshot({
                revenue: 2_844_628,
                variableCost: 0,
                salaryTotal: 1_900_000,
                interest: 100_000,
                fixedCost: 600_000,
                attritionCost: 240_000,
                profit: 4_628,
            }),
        ]

        for (const snap of snapshots) {
            for (const p of generateProblemsFromSnapshot(snap)) {
                for (const t of p.traps) {
                    expect(
                        judgeAnswer(p, t.value).verdict,
                        `${p.kind} の罠「${t.label}」(${t.value}) が正解 ${p.answer} と区別できていない`
                    ).toBe('trap')
                }
            }
        }
    })

    it('罠どうしも互いに区別できる（どちらの指摘が出るか不定にならない）', () => {
        for (const p of generateProblemsFromSnapshot(makeSnapshot())) {
            for (const t of p.traps) {
                expect(judgeAnswer(p, t.value).trap?.label).toBe(t.label)
            }
        }
    })

    it('罠には「その数値が何なのか」の名前が付く（どこで止まったかを言える）', () => {
        const problems = generateProblemsFromSnapshot(makeSnapshot())

        for (const p of problems) {
            for (const t of p.traps) {
                expect(t.label.length).toBeGreaterThan(0)
                expect(t.hint.length).toBeGreaterThan(0)
            }
        }
    })

    it('自己資本比率の罠は「分母を取り違えた」実際の値になっている', () => {
        const snap = makeSnapshot()
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'equityRatio')!

        // 正解: 純資産 ÷ 総資産（このゲームの簡易B/Sでは資産＝現金）
        expect(problem.answer).toBeCloseTo((snap.netWorth / snap.cash) * 100, 6)
        // 罠: 分母を負債にした値
        expect(problem.traps.map(t => t.value)).toContainEqual(
            expect.closeTo((snap.netWorth / snap.debt) * 100, 6)
        )
    })

    it('損益分岐点は「固定費 ÷ 限界利益率」で、固定費合計そのものは罠になっている', () => {
        const snap = makeSnapshot()
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'breakeven')!

        const fixedCostTotal = snap.salaryTotal + snap.interest + snap.fixedCost + snap.attritionCost
        const marginRatio = (snap.revenue - snap.variableCost) / snap.revenue

        expect(problem.answer).toBeCloseTo(fixedCostTotal / marginRatio, 6)
        // 変動費が無かった頃はこれが正解だった。今は最も落ちやすい罠
        expect(problem.answer).toBeGreaterThan(fixedCostTotal)

        const trapValues = problem.traps.map(t => t.value)
        expect(trapValues).toContain(fixedCostTotal)
        expect(trapValues).toContain(snap.salaryTotal)
    })

    it('限界利益率の罠は「変動費率」と「固定費まで引いた値」になっている', () => {
        const snap = makeSnapshot()
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'contributionMargin')!

        expect(problem.answer).toBeCloseTo(((snap.revenue - snap.variableCost) / snap.revenue) * 100, 6)

        const trapValues = problem.traps.map(t => t.value)
        // 変動費率（＝100 − 限界利益率）
        expect(trapValues).toContainEqual(expect.closeTo((snap.variableCost / snap.revenue) * 100, 6))
        // 固定費まで引いてしまった値（売上高利益率）
        const fixedCostTotal = snap.salaryTotal + snap.interest + snap.fixedCost + snap.attritionCost
        expect(trapValues).toContainEqual(
            expect.closeTo(((snap.revenue - snap.variableCost - fixedCostTotal) / snap.revenue) * 100, 6)
        )
    })
})

// ============================================================
// 実エンジンとの接続（ハードコードした期待値ではなく、実際の決算から作る）
// ============================================================
describe('実際のゲーム進行から生成できる', () => {
    it('calculateMonthlyRevenue が積んだ financeHistory から問題が作れる', () => {
        const game = getGame()
        game.products = [{ id: 1, name: 'テスト製品', quality: 60, sales: 0 }] as any
        calculateMonthlyRevenue()

        expect(game.financeHistory.length).toBeGreaterThan(0)

        const problems = generateDrill(game)

        expect(problems.length).toBeGreaterThan(0)
        // 正解はスナップショットの実値と一致する（別計算で辻褄を合わせていない）
        const latest = game.financeHistory[game.financeHistory.length - 1]
        const profitQ = problems.find(p => p.kind === 'profit')!
        expect(profitQ.answer).toBe(latest.profit)
    })

    it('決算がまだ無いときは空を返す（UI 側で「まず1ヶ月経営する」を出せる）', () => {
        const game = getGame()
        game.financeHistory = []

        expect(generateDrill(game)).toEqual([])
    })

    it('赤字の決算でも問題が作れる（正解が負でも壊れない）', () => {
        const snap = makeSnapshot({ revenue: 1_000_000, profit: -2_200_000 })
        const problems = generateProblemsFromSnapshot(snap)

        const profitQ = problems.find(p => p.kind === 'profit')!
        expect(profitQ.answer).toBe(-2_200_000)
    })
})

// ============================================================
// 採点
// ============================================================
describe('judgeAnswer', () => {
    it('正解なら完走扱いになる', () => {
        const problem = generateProblemsFromSnapshot(makeSnapshot()).find(p => p.kind === 'profit')!

        const r = judgeAnswer(problem, problem.answer)

        expect(r.verdict).toBe('correct')
    })

    it('丸め誤差の範囲は正解として扱う', () => {
        const problem = generateProblemsFromSnapshot(makeSnapshot()).find(p => p.kind === 'equityRatio')!
        const slightlyOff = problem.answer + problem.answer * (DRILL_TOLERANCE_RATIO / 2)

        expect(judgeAnswer(problem, slightlyOff).verdict).toBe('correct')
    })

    it('中間値を入れると罠として検出され、どこで止まったかが返る', () => {
        const snap = makeSnapshot()
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'profit')!
        // 変動費と人件費まで引いて止まった
        const stoppedEarly = snap.revenue - snap.variableCost - snap.salaryTotal

        const r = judgeAnswer(problem, stoppedEarly)

        expect(r.verdict).toBe('trap')
        expect(r.trap?.label).toContain('人件費')
    })

    it('罠でも正解でもない数値は素の不正解になる', () => {
        const problem = generateProblemsFromSnapshot(makeSnapshot()).find(p => p.kind === 'profit')!

        const r = judgeAnswer(problem, 12_345)

        expect(r.verdict).toBe('wrong')
        expect(r.trap).toBeUndefined()
    })

    it('答えが 0 の問題でも許容誤差が発散しない', () => {
        const snap = makeSnapshot({ revenue: 3_200_000, profit: 0 })
        const problem = generateProblemsFromSnapshot(snap).find(p => p.kind === 'profit')!

        expect(judgeAnswer(problem, 0).verdict).toBe('correct')
        expect(judgeAnswer(problem, 500_000).verdict).not.toBe('correct')
    })
})

// ============================================================
// 引き出し定義
// ============================================================
describe('DRAWERS', () => {
    it('すべての引き出しに名前と「開ける条件」がある', () => {
        for (const key of DRAWER_KEYS) {
            expect(DRAWERS[key].name.length).toBeGreaterThan(0)
            expect(DRAWERS[key].trigger.length).toBeGreaterThan(0)
        }
    })
})
