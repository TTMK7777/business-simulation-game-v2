// ビジネスエンパイア 2.0 - PPM（BCGマトリクス）分類（Phase 3 Wave 2-B）
//
// specs/003-market-segments-ppm.md B の実装。
// Wave 1 で用意したセグメント（縦軸＝市場成長率）と自社シェア（横軸＝相対シェア）から、
// 製品を花形／金のなる木／問題児／負け犬に分類する。
//
// 図鑑の theories.ts に定義だけあった PPM を、実データで問われる判断に変える層。
// DOM 非依存の manager 層。

import { getGame } from '../store/gameStore'
import { HIGH_GROWTH_THRESHOLD, getSegment, MARKET_SEGMENTS, DEFAULT_SEGMENT_ID } from '../config/marketSegments'
import {
    getProductSegmentId,
    getSegmentShare,
    getSegmentGrowthRate,
    getCompetitorSegmentShare
} from './SegmentManager'
import type { GameState, Product } from '../types'

export type PpmQuadrant = 'star' | 'cash_cow' | 'question_mark' | 'dog'

/** 相対シェアがこの値以上なら「高シェア」（自社が最大競合と並ぶ、が境界） */
export const HIGH_RELATIVE_SHARE = 1.0

export interface PpmQuadrantDef {
    key: PpmQuadrant
    emoji: string
    name: string
    /** その象限の定石（1行） */
    advice: string
}

export const PPM_QUADRANTS: Record<PpmQuadrant, PpmQuadrantDef> = {
    star: {
        key: 'star',
        emoji: '⭐',
        name: '花形',
        advice: '高成長・高シェア。投資を続けて地位を守る。'
    },
    cash_cow: {
        key: 'cash_cow',
        emoji: '🐄',
        name: '金のなる木',
        advice: '低成長・高シェア。稼がせて他への原資にする。'
    },
    question_mark: {
        key: 'question_mark',
        emoji: '❓',
        name: '問題児',
        advice: '高成長・低シェア。集中投資で花形を狙うか、早めに見切る。'
    },
    dog: {
        key: 'dog',
        emoji: '🐕',
        name: '負け犬',
        advice: '低成長・低シェア。撤退して資源を空けるのが定石。'
    }
}

export interface PpmEntry {
    productId: number
    productName: string
    segmentId: string
    segmentName: string
    segmentEmoji: string
    /** 縦軸: 所属セグメントの現在成長率（%） */
    growthRate: number
    /** 横軸: 相対シェア（自社セグメントシェア ÷ 最大競合シェア） */
    relativeShare: number
    /** 参考: 自社のセグメントシェア（%） */
    segmentShare: number
    quadrant: PpmQuadrant
}

export interface PpmView {
    hasProducts: boolean
    entries: PpmEntry[]
    byQuadrant: Record<PpmQuadrant, PpmEntry[]>
}

// ============================================
// 横軸: 相対シェア
// ============================================

/**
 * PPM の横軸。自社のセグメントシェアを、その市場で最大の競合のシェアで割った値。
 * 1.0 で「最大競合と並んだ」を意味する（PPM の慣例どおり）。
 */
export function getRelativeShare(state: GameState, segmentId: string): number {
    const ourShare = getSegmentShare(state, segmentId)
    const competitorShare = getCompetitorSegmentShare(state, segmentId)
    return competitorShare > 0 ? ourShare / competitorShare : 0
}

// ============================================
// 分類
// ============================================

export function classifyProduct(state: GameState, product: Product): PpmEntry {
    const segmentId = getProductSegmentId(product)
    const segment = getSegment(segmentId) ?? MARKET_SEGMENTS[DEFAULT_SEGMENT_ID]
    const growthRate = getSegmentGrowthRate(state, segmentId)
    const relativeShare = getRelativeShare(state, segmentId)

    const isHighGrowth = growthRate >= HIGH_GROWTH_THRESHOLD
    const isHighShare = relativeShare >= HIGH_RELATIVE_SHARE

    const quadrant: PpmQuadrant = isHighGrowth
        ? (isHighShare ? 'star' : 'question_mark')
        : (isHighShare ? 'cash_cow' : 'dog')

    return {
        productId: product.id,
        productName: product.name,
        segmentId,
        segmentName: segment.name,
        segmentEmoji: segment.emoji,
        growthRate,
        relativeShare,
        segmentShare: getSegmentShare(state, segmentId),
        quadrant
    }
}

// ============================================
// 表示用データ
// ============================================

export function buildPpmView(state: GameState): PpmView {
    const entries = state.products.map(product => classifyProduct(state, product))

    const byQuadrant: Record<PpmQuadrant, PpmEntry[]> = {
        star: [],
        cash_cow: [],
        question_mark: [],
        dog: []
    }
    for (const entry of entries) {
        byQuadrant[entry.quadrant].push(entry)
    }

    return {
        hasProducts: entries.length > 0,
        entries,
        byQuadrant
    }
}


// ============================================
// Wave 3-C: 撤退（PPM の「見切る」側の打ち手）
// ============================================

/** 製品を1本畳んだときに開発部の従業員から抜ける保守負荷（ストレス） */
const RETIRE_STRESS_RELIEF = 12

export interface RetireResult {
    success: boolean
    message: string
    productName?: string
    segmentId?: string
    /** 実際にストレスが下がった人数 */
    relievedEmployees?: number
}

/**
 * 製品を撤退（畳む）させる。
 *
 * PPM は「どれに注ぎ、どれを見切るか」の枠組みだが、Wave 2 まではマトリクスが
 * 見えるだけで見切る手段が無かった。ここで「見える → 動かせる」を閉じる。
 *
 * 効果:
 * - 製品を失う（その売上も消える）
 * - 開発部の従業員のストレスが下がる（保守負荷の解放）
 * - セグメントのシェアは即座には消えず、月次で減衰する（SegmentManager 側）
 *
 * 最後の1本でも撤退できる。詰みは資金ショートで既に表現されており、
 * ここで禁止すると「畳んで立て直す」判断そのものを奪ってしまうため。
 */
export function retireProduct(productId: number): RetireResult {
    const game = getGame()
    const product = game.products.find(p => p.id === productId)
    if (!product) {
        return { success: false, message: '対象の製品が見つかりません' }
    }

    const segmentId = getProductSegmentId(product)
    game.products = game.products.filter(p => p.id !== productId)

    let relievedEmployees = 0
    for (const emp of game.employees) {
        if (emp.department !== 'development') continue
        const before = emp.stress ?? 0
        if (before <= 0) continue
        emp.stress = Math.max(0, before - RETIRE_STRESS_RELIEF)
        relievedEmployees++
    }

    return {
        success: true,
        message: `${product.name} から撤退しました`,
        productName: product.name,
        segmentId,
        relievedEmployees
    }
}
