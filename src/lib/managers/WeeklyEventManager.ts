// ビジネスエンパイア 2.0 - 週次ミニイベント（Wave 2-A / 2-C）
//
// specs/002-phase2-core-loop.md A + C の実装。
// - 決算週（第4週）以外の各週で、プールから1件だけイベントを提示する
//   （4週中3週が無イベントで空振りしていた問題への対処。週最大1件でノイズ化も防ぐ）
// - イベント種別は ①決裁カード（C: DocumentManager 資産の注入）②人事イベント ③市場イベント
// - 設計制約: 全選択肢は「数字への影響」を明示する（buildImpactLabel）
//
// DOM 非依存の manager 層。乱数は注入可能。

import { getGame } from '../store/gameStore'
import { BALANCE_CONFIG } from '../gameConfig'
import {
    HR_WEEKLY_EVENTS,
    MARKET_WEEKLY_EVENTS,
    type WeeklyEventDef,
    type WeeklyEventEffect
} from '../config/weeklyEvents'
import * as DocumentManager from './DocumentManager'
import type {
    GameState,
    Employee,
    WeeklyEventKind,
    WeeklyEventState,
    WeeklyEventOptionView
} from '../types'
import type { DocumentOutcome } from '../types/document'

/** 決算週。月次決算に集中させるためミニイベントは出さない */
const SETTLEMENT_WEEK = 4

/** 未対応のまま流れた決裁カードで提出者が受けるモチベーション低下 */
const EXPIRE_MORALE_PENALTY = 3

export type RandomSource = () => number

export interface WeeklyEventResolution {
    /** 結果の説明文 */
    description: string
    /** 実際に動いた数字（UI で「打ち手→数字」を見せる） */
    impacts: string[]
    /** 決裁カードのときのみ: 経営理論タグ（v2.3.0 資産。管理モードでも発火する） */
    theoryTag?: NonNullable<DocumentOutcome['theoryTag']>
}

// ============================================
// 提示条件
// ============================================

export function isSettlementWeek(week: number): boolean {
    return week >= SETTLEMENT_WEEK
}

/**
 * 今週ミニイベントを提示すべきか。
 * 社長モードは決裁がデスクの本編なので対象外（二重提示を避ける）。
 */
export function shouldOfferWeeklyEvent(state: GameState): boolean {
    if (state.gameMode !== 'management') return false
    if (state.isBankrupt || state.isGameOver) return false
    if (isSettlementWeek(state.week)) return false
    if (state.currentWeeklyEvent) return false
    if (!state.employees || state.employees.length === 0) return false
    return true
}

// ============================================
// 数字への影響の明示（設計制約）
// ============================================

function signed(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`
}

/**
 * 選択肢が動かす指標を1行に整形する。
 * 表示と適用（applyEffect）が同じ定義を読むため、表示だけ嘘になることがない。
 */
export function buildImpactLabel(effect: WeeklyEventEffect): string {
    const parts: string[] = []
    if (effect.money) parts.push(`資金 ${signed(Math.floor(effect.money / 10000))}万円`)
    if (effect.brandPower) parts.push(`ブランド ${signed(effect.brandPower)}`)
    if (effect.marketShare) parts.push(`シェア ${signed(effect.marketShare)}`)
    if (effect.motivation) parts.push(`モチベ ${signed(effect.motivation)}`)
    if (effect.stress) parts.push(`ストレス ${signed(effect.stress)}`)
    return parts.length > 0 ? parts.join(' / ') : '変化なし'
}

// ============================================
// 種別抽選
// ============================================

/** 人事イベントの対象になりうる従業員（モチベーションが安全圏を割った者のうち最低の1名） */
function findHrTarget(state: GameState): Employee | null {
    const candidates = state.employees.filter(
        (e) => (e.motivation ?? 50) < BALANCE_CONFIG.retention.safeMotivation
    )
    if (candidates.length === 0) return null
    return candidates.reduce((a, b) => ((a.motivation ?? 50) <= (b.motivation ?? 50) ? a : b))
}

function availableMarketEvents(state: GameState): WeeklyEventDef[] {
    return MARKET_WEEKLY_EVENTS.filter((def) => !def.isAvailable || def.isAvailable(state))
}

/**
 * 種別を重み付き抽選する。
 * 決裁カードを主力にしつつ（C の狙い）、人事・市場で色を変える。
 * 対象不在の種別は候補から外れ、重みは残った種別で再配分される。
 */
export function pickWeeklyEventKind(state: GameState, rng: RandomSource): WeeklyEventKind {
    const weights: Array<{ kind: WeeklyEventKind; weight: number }> = [
        { kind: 'decision', weight: 0.5 }
    ]
    if (findHrTarget(state)) weights.push({ kind: 'hr', weight: 0.25 })
    if (availableMarketEvents(state).length > 0) weights.push({ kind: 'market', weight: 0.25 })

    const total = weights.reduce((sum, w) => sum + w.weight, 0)
    let roll = rng() * total
    for (const w of weights) {
        roll -= w.weight
        if (roll < 0) return w.kind
    }
    return weights[weights.length - 1].kind
}

// ============================================
// 生成
// ============================================

function pickFrom<T>(items: T[], rng: RandomSource): T {
    return items[Math.min(items.length - 1, Math.floor(rng() * items.length))]
}

function toOptionViews(def: WeeklyEventDef): WeeklyEventOptionView[] {
    return def.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        impact: buildImpactLabel(opt.effect)
    }))
}

/**
 * 今週のミニイベントを1件生成し、state.currentWeeklyEvent に保持する。
 * 提示条件を満たさなければ null。
 */
export function generateWeeklyEvent(rng: RandomSource = Math.random): WeeklyEventState | null {
    const game = getGame()
    if (!shouldOfferWeeklyEvent(game)) return null

    const kind = pickWeeklyEventKind(game, rng)
    let event: WeeklyEventState | null = null

    if (kind === 'decision') {
        // Wave 2-C: CEO モードの決裁カード資産を管理モードの週次イベントとして注入する
        const [doc] = DocumentManager.generateDocuments(game, 1)
        if (doc) {
            game.documentQueue.push(doc)
            event = {
                kind: 'decision',
                defId: doc.id,
                emoji: '📋',
                title: doc.title,
                description: `${doc.submitter.name}（${doc.department}部）からの申請です。\n${doc.summary}`,
                options: [
                    {
                        id: 'approve',
                        label: '✅ 承認する',
                        impact: `資金 -${Math.floor(doc.details.amount / 10000)}万円 / ${doc.details.expectedBenefit}`
                    },
                    {
                        id: 'reject',
                        label: '❌ 却下する',
                        impact: '資金 変化なし / 提出者のモチベーションは下がる'
                    }
                ],
                documentId: doc.id,
                turn: game.turn
            }
        }
    } else if (kind === 'hr') {
        const target = findHrTarget(game)
        const def = pickFrom(HR_WEEKLY_EVENTS, rng)
        if (target && def) {
            event = {
                kind: 'hr',
                defId: def.id,
                emoji: def.emoji,
                title: def.title,
                description: def.description.replace('{name}', target.name),
                options: toOptionViews(def),
                targetEmployeeId: target.id,
                turn: game.turn
            }
        }
    } else {
        const pool = availableMarketEvents(game)
        const def = pool.length > 0 ? pickFrom(pool, rng) : null
        if (def) {
            event = {
                kind: 'market',
                defId: def.id,
                emoji: def.emoji,
                title: def.title,
                description: def.description,
                options: toOptionViews(def),
                turn: game.turn
            }
        }
    }

    game.currentWeeklyEvent = event
    return event
}

// ============================================
// 解決
// ============================================

function findDef(defId: string): WeeklyEventDef | undefined {
    return [...HR_WEEKLY_EVENTS, ...MARKET_WEEKLY_EVENTS].find((d) => d.id === defId)
}

function applyEffect(state: GameState, effect: WeeklyEventEffect, target: Employee | null): string[] {
    const impacts: string[] = []

    if (effect.money) {
        state.money += effect.money
        impacts.push(`資金 ${signed(Math.floor(effect.money / 10000))}万円`)
    }
    if (effect.brandPower) {
        state.brandPower = Math.max(0, Math.min(100, state.brandPower + effect.brandPower))
        impacts.push(`ブランド ${signed(effect.brandPower)}`)
    }
    if (effect.marketShare) {
        state.marketShare = Math.max(0, Math.min(60, state.marketShare + effect.marketShare))
        impacts.push(`シェア ${signed(effect.marketShare)}`)
    }
    if (target && effect.motivation) {
        target.motivation = Math.max(
            BALANCE_CONFIG.motivation.minMotivation,
            Math.min(BALANCE_CONFIG.motivation.maxMotivation, (target.motivation ?? 50) + effect.motivation)
        )
        impacts.push(`${target.name} モチベ ${signed(effect.motivation)}`)
    }
    if (target && effect.stress) {
        target.stress = Math.max(0, Math.min(100, (target.stress ?? 0) + effect.stress))
        impacts.push(`${target.name} ストレス ${signed(effect.stress)}`)
    }

    return impacts
}

/**
 * 提示中イベントの選択肢を適用する。
 * 未提示・未知の選択肢なら null を返し、イベントは消費しない（誤操作でイベントを失わせない）。
 */
export function resolveWeeklyEvent(optionId: string): WeeklyEventResolution | null {
    const game = getGame()
    const event = game.currentWeeklyEvent
    if (!event) return null

    if (event.kind === 'decision') {
        if (optionId !== 'approve' && optionId !== 'reject') return null
        const docId = event.documentId
        if (!docId) return null

        const outcome = DocumentManager.processVerdict(game, docId, optionId)
        if (!outcome) return null

        const impacts: string[] = []
        if (outcome.moneyChange) impacts.push(`資金 ${signed(Math.floor(outcome.moneyChange / 10000))}万円`)
        if (outcome.marketShareChange) impacts.push(`シェア ${signed(outcome.marketShareChange)}`)
        if (outcome.brandPowerChange) impacts.push(`ブランド ${signed(outcome.brandPowerChange)}`)
        if (outcome.employeeMoraleChange) impacts.push(`提出者のモチベ ${signed(outcome.employeeMoraleChange)}`)

        game.currentWeeklyEvent = null
        return {
            description: outcome.description,
            impacts,
            theoryTag: outcome.theoryTag
        }
    }

    const def = findDef(event.defId)
    const option = def?.options.find((o) => o.id === optionId)
    if (!def || !option) return null

    const target = event.targetEmployeeId
        ? game.employees.find((e) => e.id === event.targetEmployeeId) ?? null
        : null

    const impacts = applyEffect(game, option.effect, target)
    game.currentWeeklyEvent = null

    return { description: option.resultText, impacts }
}

/**
 * 未対応のまま次の週へ流れたイベントを失効させる。
 * 決裁カードは放置＝意思決定の放棄なので、キューから外し提出者のモチベーションを下げる。
 * 戻り値は失効させたかどうか。
 */
export function expireWeeklyEvent(): boolean {
    const game = getGame()
    const event = game.currentWeeklyEvent
    if (!event) return false

    if (event.kind === 'decision' && event.documentId) {
        const doc = game.documentQueue.find((d) => d.id === event.documentId)
        if (doc) {
            game.documentQueue = game.documentQueue.filter((d) => d.id !== event.documentId)
            const submitter = game.employees.find((e) => e.id === doc.submitter.employeeId)
            if (submitter) {
                submitter.motivation = Math.max(
                    BALANCE_CONFIG.motivation.minMotivation,
                    (submitter.motivation ?? 50) - EXPIRE_MORALE_PENALTY
                )
            }
        }
    }

    game.currentWeeklyEvent = null
    return true
}
