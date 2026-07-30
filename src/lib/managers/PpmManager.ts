// ビジネスエンパイア 2.0 - PPM（BCGマトリクス）分類（Phase 3 Wave 2-B）
//
// specs/003-market-segments-ppm.md B の実装。
// Wave 1 で用意したセグメント（縦軸＝市場成長率）と自社シェア（横軸＝相対シェア）から、
// 製品を花形／金のなる木／問題児／負け犬に分類する。
//
// 図鑑の theories.ts に定義だけあった PPM を、実データで問われる判断に変える層。
// DOM 非依存の manager 層。

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
