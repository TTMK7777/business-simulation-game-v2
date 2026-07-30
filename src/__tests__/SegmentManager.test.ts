/**
 * SegmentManager.ts のユニットテスト（Phase 3 Wave 1-A: 市場セグメント基盤）
 *
 * テスト対象:
 * - getCurrentGrowthRate(): 成長率の時間変動（新興は高成長 → 成熟で鈍化）
 * - getSegmentElapsedMonths(): ゲーム開始からの経過月数
 * - growSegmentShares(): 製品を持つセグメントで自社シェアが伸びる
 * - deriveOverallMarketShare(): セグメントシェアの加重平均 → 既存 game.marketShare 互換
 * - getSegmentSalesMultiplier(): 売上へのセグメント反映（規模 × 自社シェア）
 * - getCompetitorSegmentShare(): PPM 横軸（相対シェア）の分母
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSegmentElapsedMonths,
  growSegmentShares,
  deriveOverallMarketShare,
  getSegmentSalesMultiplier,
  getCompetitorSegmentShare,
  getSegmentShare,
  ensureSegmentShares,
} from '../lib/managers/SegmentManager'
import {
  MARKET_SEGMENTS,
  getCurrentGrowthRate,
  SEGMENT_IDS,
  DEFAULT_SEGMENT_ID,
} from '../lib/config/marketSegments'
import { getGame, resetGameState } from '../lib/store/gameStore'
import type { Product } from '../lib/types/index'

beforeEach(() => {
  resetGameState()
})

function makeProduct(overrides: Partial<Product> = {}): Product {
  return { id: 1, name: 'テスト製品', quality: 50, sales: 0, ...overrides }
}

// ============================================================
// 成長率の時間変動
// ============================================================
describe('getCurrentGrowthRate', () => {
  const ai = MARKET_SEGMENTS.ai

  it('開始時点は initialGrowthRate', () => {
    expect(getCurrentGrowthRate(ai, 0)).toBe(ai.initialGrowthRate)
  })

  it('成熟後は maturedGrowthRate で頭打ちになる', () => {
    expect(getCurrentGrowthRate(ai, ai.maturityMonths)).toBe(ai.maturedGrowthRate)
    expect(getCurrentGrowthRate(ai, ai.maturityMonths + 50)).toBe(ai.maturedGrowthRate)
  })

  it('途中は単調に鈍化する（高成長市場が永続しない＝入れ替え判断が生まれる）', () => {
    const early = getCurrentGrowthRate(ai, 2)
    const mid = getCurrentGrowthRate(ai, 7)
    const late = getCurrentGrowthRate(ai, 13)

    expect(early).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(late)
  })

  it('成熟が遅いセグメントは同時点で成長率を保っている', () => {
    // enterprise は maturityMonths が長い
    const aiAt12 = getCurrentGrowthRate(MARKET_SEGMENTS.ai, 12)
    const entAt12 = getCurrentGrowthRate(MARKET_SEGMENTS.enterprise, 12)
    // 12ヶ月時点では AI は既に鈍化し、初期の優位が消えている
    expect(aiAt12).toBeLessThan(MARKET_SEGMENTS.ai.initialGrowthRate)
    expect(entAt12).toBeGreaterThan(MARKET_SEGMENTS.enterprise.maturedGrowthRate)
  })
})

// ============================================================
// 経過月数
// ============================================================
describe('getSegmentElapsedMonths', () => {
  it('開始年月からの差分を返す', () => {
    const game = getGame()
    game.year = 2026
    game.month = 3
    expect(getSegmentElapsedMonths(game)).toBe(14)
  })

  it('開始時点は0', () => {
    const game = getGame()
    expect(getSegmentElapsedMonths(game)).toBe(0)
  })
})

// ============================================================
// セグメントシェアの初期化
// ============================================================
describe('ensureSegmentShares', () => {
  it('全セグメント分のキーを0で用意する', () => {
    const game = getGame()
    game.segmentShares = {} as any

    ensureSegmentShares(game)

    for (const id of SEGMENT_IDS) {
      expect(game.segmentShares[id]).toBe(0)
    }
  })

  it('既存の値は壊さない', () => {
    const game = getGame()
    game.segmentShares = { smb: 12 } as any

    ensureSegmentShares(game)

    expect(game.segmentShares.smb).toBe(12)
    expect(game.segmentShares.ai).toBe(0)
  })
})

// ============================================================
// シェア成長
// ============================================================
describe('growSegmentShares', () => {
  it('製品を持つセグメントだけシェアが伸びる', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1, segmentId: 'ai' })]

    growSegmentShares(game)

    expect(game.segmentShares.ai).toBeGreaterThan(0)
    expect(game.segmentShares.smb).toBe(0)
  })

  it('同じセグメントに製品が多いほど速く伸びる', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1, segmentId: 'ai' })]
    growSegmentShares(game)
    const oneProduct = game.segmentShares.ai

    resetGameState()
    const game2 = getGame()
    ensureSegmentShares(game2)
    game2.products = [
      makeProduct({ id: 1, segmentId: 'ai' }),
      makeProduct({ id: 2, segmentId: 'ai' }),
    ]
    growSegmentShares(game2)

    expect(game2.segmentShares.ai).toBeGreaterThan(oneProduct)
  })

  it('高成長セグメントの方が伸びが速い（成長率が効いている）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1, segmentId: 'ai' }), makeProduct({ id: 2, segmentId: 'enterprise' })]

    growSegmentShares(game)

    expect(game.segmentShares.ai).toBeGreaterThan(game.segmentShares.enterprise)
  })

  it('シェアは100%を超えない', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 99.9
    game.products = [makeProduct({ id: 1, segmentId: 'ai' })]

    for (let i = 0; i < 20; i++) growSegmentShares(game)

    expect(game.segmentShares.ai).toBeLessThanOrEqual(100)
  })

  it('segmentId 未設定の製品は既定セグメントに寄せて扱う（旧セーブ耐性）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1 })]

    growSegmentShares(game)

    expect(game.segmentShares[DEFAULT_SEGMENT_ID]).toBeGreaterThan(0)
  })
})

// ============================================================
// 全体シェアの導出（既存 marketShare 互換）
// ============================================================
describe('deriveOverallMarketShare', () => {
  it('セグメント規模で重み付けした平均になる', () => {
    const game = getGame()
    ensureSegmentShares(game)
    // 全セグメントで一律10%なら全体も10%
    for (const id of SEGMENT_IDS) game.segmentShares[id] = 10

    expect(deriveOverallMarketShare(game)).toBeCloseTo(10, 6)
  })

  it('規模の大きいセグメントのシェアが強く効く', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.enterprise = 40 // sizeFactor 最大

    const withBig = deriveOverallMarketShare(game)

    ensureSegmentShares(game)
    for (const id of SEGMENT_IDS) game.segmentShares[id] = 0
    game.segmentShares.consumer = 40 // sizeFactor 最小

    expect(withBig).toBeGreaterThan(deriveOverallMarketShare(game))
  })

  it('シェアゼロなら0', () => {
    const game = getGame()
    ensureSegmentShares(game)
    expect(deriveOverallMarketShare(game)).toBe(0)
  })
})

// ============================================================
// 売上への反映
// ============================================================
describe('getSegmentSalesMultiplier', () => {
  it('セグメント未指定でも既定セグメントとして係数を返す', () => {
    const game = getGame()
    ensureSegmentShares(game)
    expect(getSegmentSalesMultiplier(game, makeProduct())).toBeGreaterThan(0)
  })

  it('規模の大きいセグメントの方が売上係数が大きい（同シェア時）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.enterprise = 10
    game.segmentShares.consumer = 10

    const ent = getSegmentSalesMultiplier(game, makeProduct({ segmentId: 'enterprise' }))
    const con = getSegmentSalesMultiplier(game, makeProduct({ segmentId: 'consumer' }))

    expect(ent).toBeGreaterThan(con)
  })

  it('自社シェアが高いほど売上係数が大きい', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 1
    const low = getSegmentSalesMultiplier(game, makeProduct({ segmentId: 'ai' }))
    game.segmentShares.ai = 30
    const high = getSegmentSalesMultiplier(game, makeProduct({ segmentId: 'ai' }))

    expect(high).toBeGreaterThan(low)
  })
})

// ============================================================
// 競合セグメントシェア（PPM 横軸の分母）
// ============================================================
describe('getCompetitorSegmentShare', () => {
  it('競合が強いセグメントほど大きい値になる', () => {
    const game = getGame()
    ensureSegmentShares(game)

    const ent = getCompetitorSegmentShare(game, 'enterprise')
    const ai = getCompetitorSegmentShare(game, 'ai')

    expect(ent).toBeGreaterThan(ai)
  })

  it('自社シェアが伸びた分だけ競合の取り分は減る', () => {
    const game = getGame()
    ensureSegmentShares(game)
    const before = getCompetitorSegmentShare(game, 'ai')
    game.segmentShares.ai = 20
    const after = getCompetitorSegmentShare(game, 'ai')

    expect(after).toBeLessThan(before)
  })

  it('0未満にはならない（相対シェアの分母として安全）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 100

    expect(getCompetitorSegmentShare(game, 'ai')).toBeGreaterThan(0)
  })
})

// ============================================================
// getSegmentShare
// ============================================================
describe('getSegmentShare', () => {
  it('未初期化でも0を返す（NaN 汚染の防止）', () => {
    const game = getGame()
    game.segmentShares = {} as any
    expect(getSegmentShare(game, 'ai')).toBe(0)
  })
})
