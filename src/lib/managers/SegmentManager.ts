// ビジネスエンパイア 2.0 - 市場セグメント管理（Phase 3 Wave 1-A）
//
// specs/003-market-segments-ppm.md A の実装。
// 単一市場モデルを4セグメントに分割し、製品ごとに「どの市場で戦っているか」を持たせる。
// これで PPM の縦軸（市場成長率）が製品ごとに存在するようになる。
//
// 既存の game.marketShare は据え置き（廃止も導出化もしない）。
// マーケ実行・決裁・訪問者・競合攻撃など9箇所が marketShare を直接動かしており、
// セグメントからの導出値にするとそれらの効果を黙って上書きして消してしまうため。
// 製品駆動のシェア成長だけをセグメント経由にし、その増分を marketShare に加算する。
//
// DOM 非依存の manager 層。

import {
    MARKET_SEGMENTS,
    SEGMENT_IDS,
    DEFAULT_SEGMENT_ID,
    getSegment,
    getCurrentGrowthRate
} from '../config/marketSegments'
import type { GameState, Product } from '../types'

/** 1ヶ月あたりのシェア成長の基礎値（%）。成長率と製品数で増減する */
const BASE_SHARE_GAIN = 0.35

/** セグメント内の自社シェア上限（%）。独占は起きない前提 */
const MAX_SEGMENT_SHARE = 100

/** 競合シェアの下限（%）。相対シェアの分母が0にならないようにする */
const MIN_COMPETITOR_SHARE = 1

// ============================================
// 基本アクセサ
// ============================================

/** 製品が属するセグメント id（未設定の旧セーブは既定セグメント扱い） */
export function getProductSegmentId(product: Product): string {
    const id = product.segmentId
    return id && MARKET_SEGMENTS[id] ? id : DEFAULT_SEGMENT_ID
}

/** セグメント別の自社シェア（%）。未初期化でも 0 を返す（NaN 汚染の防止） */
export function getSegmentShare(state: GameState, segmentId: string): number {
    const value = state.segmentShares?.[segmentId]
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/** 全セグメント分のキーを用意する（既存の値は壊さない） */
export function ensureSegmentShares(state: GameState): void {
    if (!state.segmentShares || typeof state.segmentShares !== 'object') {
        state.segmentShares = {}
    }
    for (const id of SEGMENT_IDS) {
        if (typeof state.segmentShares[id] !== 'number' || !Number.isFinite(state.segmentShares[id])) {
            state.segmentShares[id] = 0
        }
    }
}

/** ゲーム開始からの経過月数（セグメントの成熟度に使う） */
export function getSegmentElapsedMonths(state: GameState): number {
    const startYear = state.scenarioStartYear ?? 2025
    const startMonth = state.scenarioStartMonth ?? 1
    return Math.max(0, (state.year - startYear) * 12 + (state.month - startMonth))
}

/** 今月の当該セグメントの成長率（%） */
export function getSegmentGrowthRate(state: GameState, segmentId: string): number {
    const segment = getSegment(segmentId) ?? MARKET_SEGMENTS[DEFAULT_SEGMENT_ID]
    return getCurrentGrowthRate(segment, getSegmentElapsedMonths(state))
}

// ============================================
// シェア成長
// ============================================

/**
 * 製品を持つセグメントの自社シェアを月次で伸ばす。
 *
 * 伸び幅は「製品数 × セグメントの現在成長率」で決まる。
 * 高成長セグメントほど速く食い込めるが、成熟すると伸びが鈍る＝入れ替え判断が生まれる。
 *
 * @returns 全体シェア換算の増加分（%）。既存の game.marketShare に加算するための値。
 *   marketShare をセグメントからの導出値にはしない — マーケ実行・決裁・競合攻撃など
 *   9箇所が marketShare を直接動かしており、導出にするとそれらの効果を黙って消すため。
 */
export function growSegmentShares(state: GameState): number {
    ensureSegmentShares(state)

    const productCountBySegment: Record<string, number> = {}
    for (const product of state.products) {
        const segmentId = getProductSegmentId(product)
        productCountBySegment[segmentId] = (productCountBySegment[segmentId] ?? 0) + 1
    }

    let weightedGain = 0
    let totalWeight = 0
    for (const id of SEGMENT_IDS) {
        totalWeight += MARKET_SEGMENTS[id].sizeFactor
    }

    for (const [segmentId, count] of Object.entries(productCountBySegment)) {
        const growthRate = getSegmentGrowthRate(state, segmentId)
        const gain = BASE_SHARE_GAIN * count * (1 + growthRate / 5)
        const before = getSegmentShare(state, segmentId)
        const after = Math.min(MAX_SEGMENT_SHARE, before + gain)
        state.segmentShares[segmentId] = after

        const segment = getSegment(segmentId) ?? MARKET_SEGMENTS[DEFAULT_SEGMENT_ID]
        weightedGain += (after - before) * segment.sizeFactor
    }

    return totalWeight > 0 ? weightedGain / totalWeight : 0
}

// ============================================
// 全体シェアの導出（既存 marketShare 互換）
// ============================================

/**
 * セグメント規模で重み付けした全体シェア（%）。
 *
 * 注: これは game.marketShare には代入しない（marketShare は既存の全機構が動かす権威値）。
 * 「セグメント全体でどれだけ取れているか」を表示・分析に使うための値。
 */
export function deriveOverallMarketShare(state: GameState): number {
    ensureSegmentShares(state)

    let weighted = 0
    let totalWeight = 0
    for (const id of SEGMENT_IDS) {
        const segment = MARKET_SEGMENTS[id]
        weighted += getSegmentShare(state, id) * segment.sizeFactor
        totalWeight += segment.sizeFactor
    }
    return totalWeight > 0 ? weighted / totalWeight : 0
}

// ============================================
// 売上への反映
// ============================================

/**
 * 製品売上に掛けるセグメント係数。
 * 「大きい市場か × その市場でどれだけ取れているか」を1つの倍率で表す。
 *
 * シェア0でも売上が消えないよう下駄（1.0）を履かせる。ここを0起点にすると
 * 製品を出した最初の月に売上ゼロになり、開発投資の回収見込みが立たなくなるため。
 */
export function getSegmentSalesMultiplier(state: GameState, product: Product): number {
    const segmentId = getProductSegmentId(product)
    const segment = getSegment(segmentId) ?? MARKET_SEGMENTS[DEFAULT_SEGMENT_ID]
    const share = getSegmentShare(state, segmentId)

    return segment.sizeFactor * (1 + share / 100)
}

// ============================================
// 競合シェア（PPM 横軸の分母）
// ============================================

/**
 * 当該セグメントで最大の競合が持つシェアの目安（%）。
 * PPM の相対シェア（自社 ÷ 最大競合）の分母になる。
 *
 * 個別競合のセグメント別シェアは持たないため、セグメント定義の competitorShare から
 * 自社が奪った分を差し引いて近似する。0除算を避けるため下限を設ける。
 */
export function getCompetitorSegmentShare(state: GameState, segmentId: string): number {
    const segment = getSegment(segmentId) ?? MARKET_SEGMENTS[DEFAULT_SEGMENT_ID]
    const ourShare = getSegmentShare(state, segmentId)
    return Math.max(MIN_COMPETITOR_SHARE, segment.competitorShare - ourShare)
}
