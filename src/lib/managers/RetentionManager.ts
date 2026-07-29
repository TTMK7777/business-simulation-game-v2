// ビジネスエンパイア 2.0 - 定着管理（Wave 1-B: 退職・モチベーションの実効化）
//
// specs/002-phase2-core-loop.md B の実装。
// - motivation の変動源を「過重労働 / 放置 / 研修 / 決裁結果」に整理する
// - gameConfig で定義済みのまま未使用だった employeeResignChance をモチベーション連動で接続する
// - 隠れ特性 burnout_prone / inconsistent を実効化する（従来は表示のみで効果ゼロだった）
//
// DOM 非依存の manager 層。乱数は呼び出し側から注入できるようにしてテスト可能にしている。

import { getGame } from '../store/gameStore'
import { BALANCE_CONFIG } from '../gameConfig'
import type { Employee } from '../types'

const R = BALANCE_CONFIG.retention

/** 退職判定・パフォーマンス変動に使う乱数源（テストから差し替え可能） */
export type RandomSource = () => number

export interface MotivationDeltaResult {
    /** 今月の motivation 増減（クランプ前） */
    delta: number
    /** 増減の理由ラベル（UI での説明・デバッグ用） */
    reasons: string[]
}

/** 退職した従業員の記録（従業員配列から取り除いた後も参照できるようコピーを返す） */
export interface Resignation {
    id: number
    name: string
    salary: number
    department: string
    motivation: number
}

/** 退職予備軍（安全圏を下回った在籍者）。予兆の可視化に使う */
export interface AtRiskEmployee {
    id: number
    name: string
    motivation: number
}

export interface RetentionResult {
    resignations: Resignation[]
    /** 退職に伴う再採用コストの合計（円） */
    attritionCost: number
    atRisk: AtRiskEmployee[]
}

// ============================================
// モチベーション変動
// ============================================

/**
 * 今月の motivation 増減を算出する。
 *
 * 決裁結果（DocumentManager.processVerdict の employeeMoraleChange）は既に即時反映されるため
 * ここでは扱わない（二重適用の防止）。
 */
export function calculateMotivationDelta(employee: Employee, currentTurn: number): MotivationDeltaResult {
    const reasons: string[] = []
    let delta = 0

    const stress = employee.stress ?? 0

    // 過重労働 / 休息
    if (stress >= R.highStressThreshold) {
        delta -= R.highStressPenalty
        reasons.push('過重労働')
    } else if (stress >= R.midStressThreshold) {
        delta -= R.midStressPenalty
        reasons.push('繁忙')
    } else if (stress <= R.lowStressThreshold) {
        delta += R.lowStressRecovery
        reasons.push('休息')
    }

    // 放置（最後の研修、未経験なら入社からの経過ターン）
    const lastCare = employee.lastTrainingTurn ?? employee.joinedTurn ?? 1
    if (currentTurn - lastCare >= R.neglectTurns) {
        delta -= R.neglectPenalty
        reasons.push('放置')
    }

    // 隠れ特性 burnout_prone: 判明済みかつ高ストレス時に燃え尽きが加速する
    if (
        employee.hiddenTraitRevealed &&
        employee.hiddenTrait === 'burnout_prone' &&
        stress >= R.highStressThreshold
    ) {
        delta -= R.burnoutExtraPenalty
        reasons.push('燃え尽き')
    }

    return { delta, reasons }
}

// ============================================
// 退職確率
// ============================================

/**
 * employeeResignChance をモチベーション帯で増幅した今月の退職確率を返す。
 * 安全圏（safeMotivation 以上）は 0 を返し、上限は maxResignChance でクランプする。
 */
export function calculateResignChance(employee: Employee): number {
    const motivation = employee.motivation ?? 50
    if (motivation >= R.safeMotivation) return 0

    let chance = BALANCE_CONFIG.events.employeeResignChance

    if (motivation < 30) {
        chance *= R.resignMultiplierCritical
    } else if (motivation < 50) {
        chance *= R.resignMultiplierLow
    } else {
        chance *= R.resignMultiplierNormal
    }

    if (employee.hiddenTraitRevealed) {
        if (employee.hiddenTrait === 'burnout_prone') {
            chance *= R.burnoutResignMultiplier
            if ((employee.stress ?? 0) >= R.highStressThreshold) {
                chance *= R.burnoutHighStressMultiplier
            }
        } else if (employee.hiddenTrait === 'inconsistent') {
            chance *= R.inconsistentResignMultiplier
        }
    }

    return Math.min(R.maxResignChance, chance)
}

// ============================================
// inconsistent: 月次パフォーマンス変動
// ============================================

/**
 * 隠れ特性 inconsistent（判明済み）の今月のパフォーマンス倍率を振る。
 * それ以外の従業員は常に 1（＝売上式に影響しない）。
 */
export function rollPerformanceMultiplier(employee: Employee, rng: RandomSource): number {
    if (!employee.hiddenTraitRevealed || employee.hiddenTrait !== 'inconsistent') return 1

    const span = R.inconsistentMaxPerformance - R.inconsistentMinPerformance
    return R.inconsistentMinPerformance + rng() * span
}

// ============================================
// 売上ドライバー: 労働力係数
// ============================================

/**
 * 平均実効モチベーション（motivation × performanceMultiplier）から売上係数を算出する。
 *
 * neutralMotivation ちょうどで 1.0 になる設計。既存バランスの基準点を動かさないまま、
 * モチベーション低下（＝退職の予兆）が売上ドライバー分解に見える形で効くようにする。
 */
export function calculateWorkforceMultiplier(employees: Employee[]): number {
    if (employees.length === 0) return 1

    const effectiveTotal = employees.reduce((sum, emp) => {
        const motivation = emp.motivation ?? 50
        const performance = emp.performanceMultiplier ?? 1
        return sum + motivation * performance
    }, 0)
    const average = effectiveTotal / employees.length

    if (average >= R.neutralMotivation) {
        const upsideSpan = BALANCE_CONFIG.motivation.maxMotivation - R.neutralMotivation
        const ratio = upsideSpan > 0 ? (average - R.neutralMotivation) / upsideSpan : 0
        return 1 + Math.min(1, ratio) * R.workforceUpsideAtMax
    }

    const downsideSpan = R.neutralMotivation - R.workforceMinMotivation
    const ratio = downsideSpan > 0 ? (R.neutralMotivation - average) / downsideSpan : 0
    return 1 - Math.min(1, ratio) * R.workforceDownsideAtMin
}

// ============================================
// 月次の定着処理
// ============================================

/**
 * 月次のモチベーション更新・パフォーマンス変動・退職判定をまとめて行う。
 * GameManager の月次ブロックから、月次決算（calculateMonthlyRevenue）より前に呼ぶこと。
 * 退職による人員減と再採用コストを同じ月の P/L に反映させるため。
 */
export function processMonthlyRetention(rng: RandomSource = Math.random): RetentionResult {
    const game = getGame()
    const currentTurn = game.turn

    // 1. モチベーション更新 + inconsistent のパフォーマンス振り直し
    game.employees.forEach((emp: Employee) => {
        const { delta } = calculateMotivationDelta(emp, currentTurn)
        const next = (emp.motivation ?? 50) + delta
        emp.motivation = Math.max(
            BALANCE_CONFIG.motivation.minMotivation,
            Math.min(BALANCE_CONFIG.motivation.maxMotivation, next)
        )
        emp.performanceMultiplier = rollPerformanceMultiplier(emp, rng)
    })

    // 2. 退職判定（1ヶ月の退職は maxResignationsPerMonth まで、在籍は minRemainingEmployees を下回らせない）
    const resignations: Resignation[] = []
    for (const emp of [...game.employees]) {
        if (resignations.length >= R.maxResignationsPerMonth) break
        if (game.employees.length - resignations.length <= R.minRemainingEmployees) break

        const chance = calculateResignChance(emp)
        if (chance <= 0) continue
        if (rng() >= chance) continue

        resignations.push({
            id: emp.id,
            name: emp.name,
            salary: emp.salary,
            department: emp.department,
            motivation: emp.motivation
        })
    }

    if (resignations.length > 0) {
        const resignedIds = new Set(resignations.map(r => r.id))
        game.employees = game.employees.filter((emp: Employee) => !resignedIds.has(emp.id))
    }

    const attritionCost = resignations.reduce(
        (sum, r) => sum + Math.floor(r.salary * R.rehireCostSalaryMultiplier),
        0
    )

    // 3. 予兆: 在籍者のうち安全圏を下回った従業員
    const atRisk: AtRiskEmployee[] = game.employees
        .filter((emp: Employee) => (emp.motivation ?? 50) < R.safeMotivation)
        .map((emp: Employee) => ({ id: emp.id, name: emp.name, motivation: emp.motivation }))

    return { resignations, attritionCost, atRisk }
}
