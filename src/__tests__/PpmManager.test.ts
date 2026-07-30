/**
 * PpmManager.ts のユニットテスト（Phase 3 Wave 2-B: PPM 実UI の分類ロジック）
 *
 * テスト対象:
 * - getRelativeShare(): PPM 横軸（自社セグメントシェア ÷ 最大競合シェア）
 * - classifyProduct(): 縦軸(成長率) × 横軸(相対シェア) の4象限分類
 * - buildPpmView(): 製品を象限ごとにまとめた表示用データ
 * - PPM_QUADRANTS: 象限ごとの定石が全象限そろっている
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getRelativeShare,
  classifyProduct,
  buildPpmView,
  PPM_QUADRANTS,
  retireProduct,
} from '../lib/managers/PpmManager'
import { ensureSegmentShares } from '../lib/managers/SegmentManager'
import { HIGH_GROWTH_THRESHOLD, MARKET_SEGMENTS } from '../lib/config/marketSegments'
import { getGame, resetGameState } from '../lib/store/gameStore'
import type { Product } from '../lib/types/index'

beforeEach(() => {
  resetGameState()
})

function makeProduct(overrides: Partial<Product> = {}): Product {
  return { id: 1, name: 'テスト製品', quality: 50, sales: 0, ...overrides }
}

/** 成長率が閾値以上/未満になる月まで進める */
function setElapsedMonths(months: number) {
  const game = getGame()
  game.scenarioStartYear = 2025
  game.scenarioStartMonth = 1
  game.year = 2025 + Math.floor(months / 12)
  game.month = 1 + (months % 12)
}

// ============================================================
// 相対シェア（PPM 横軸）
// ============================================================
describe('getRelativeShare', () => {
  it('自社シェア0なら0', () => {
    const game = getGame()
    ensureSegmentShares(game)
    expect(getRelativeShare(game, 'ai')).toBe(0)
  })

  it('自社シェアが最大競合と並べば1.0になる', () => {
    const game = getGame()
    ensureSegmentShares(game)
    // ai の competitorShare は 25。自社が 12.5 なら競合も 12.5 で並ぶ
    game.segmentShares.ai = MARKET_SEGMENTS.ai.competitorShare / 2

    expect(getRelativeShare(game, 'ai')).toBeCloseTo(1, 6)
  })

  it('自社シェアが伸びるほど大きくなる（単調増加）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 5
    const low = getRelativeShare(game, 'ai')
    game.segmentShares.ai = 15
    const high = getRelativeShare(game, 'ai')

    expect(high).toBeGreaterThan(low)
  })

  it('競合が厚い市場ほど同じ自社シェアでも相対シェアは低い', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.enterprise = 10 // competitorShare 70
    game.segmentShares.ai = 10 // competitorShare 25

    expect(getRelativeShare(game, 'enterprise')).toBeLessThan(getRelativeShare(game, 'ai'))
  })
})

// ============================================================
// 4象限分類
// ============================================================
describe('classifyProduct', () => {
  it('高成長 × 高相対シェア = 花形', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(0) // ai は初期 9.0%
    game.segmentShares.ai = 20 // 競合5 → 相対4.0

    const result = classifyProduct(game, makeProduct({ segmentId: 'ai' }))

    expect(result.quadrant).toBe('star')
    expect(result.growthRate).toBeGreaterThanOrEqual(HIGH_GROWTH_THRESHOLD)
    expect(result.relativeShare).toBeGreaterThanOrEqual(1)
  })

  it('高成長 × 低相対シェア = 問題児', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(0)
    game.segmentShares.ai = 1

    expect(classifyProduct(game, makeProduct({ segmentId: 'ai' })).quadrant).toBe('question_mark')
  })

  it('低成長 × 高相対シェア = 金のなる木', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(30) // ai は成熟して 1.0%
    game.segmentShares.ai = 20

    const result = classifyProduct(game, makeProduct({ segmentId: 'ai' }))

    expect(result.growthRate).toBeLessThan(HIGH_GROWTH_THRESHOLD)
    expect(result.quadrant).toBe('cash_cow')
  })

  it('低成長 × 低相対シェア = 負け犬', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(30)
    game.segmentShares.ai = 0.5

    expect(classifyProduct(game, makeProduct({ segmentId: 'ai' })).quadrant).toBe('dog')
  })

  it('時間経過で花形が金のなる木へ移る（成熟＝入れ替え判断の発生）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 20
    const product = makeProduct({ segmentId: 'ai' })

    setElapsedMonths(0)
    expect(classifyProduct(game, product).quadrant).toBe('star')

    setElapsedMonths(30)
    expect(classifyProduct(game, product).quadrant).toBe('cash_cow')
  })

  it('segmentId 未設定の製品でも分類できる（旧セーブ耐性）', () => {
    const game = getGame()
    ensureSegmentShares(game)

    const result = classifyProduct(game, makeProduct())

    expect(result.segmentId).toBe('smb')
    expect(['star', 'cash_cow', 'question_mark', 'dog']).toContain(result.quadrant)
  })

  it('分類結果は製品名とセグメント名を持つ（UI がそのまま描ける）', () => {
    const game = getGame()
    ensureSegmentShares(game)

    const result = classifyProduct(game, makeProduct({ name: 'プロダクトA', segmentId: 'consumer' }))

    expect(result.productName).toBe('プロダクトA')
    expect(result.segmentName).toBe(MARKET_SEGMENTS.consumer.name)
  })
})

// ============================================================
// 象限の定石
// ============================================================
describe('PPM_QUADRANTS', () => {
  it('4象限すべてに名前と定石がある', () => {
    for (const key of ['star', 'cash_cow', 'question_mark', 'dog'] as const) {
      expect(PPM_QUADRANTS[key].name.length).toBeGreaterThan(0)
      expect(PPM_QUADRANTS[key].advice.length).toBeGreaterThan(0)
      expect(PPM_QUADRANTS[key].emoji.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// 表示用データ
// ============================================================
describe('buildPpmView', () => {
  it('製品がなければ空（UI 側で「まだ製品がない」を出せる）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = []

    const view = buildPpmView(game)

    expect(view.entries).toEqual([])
    expect(view.hasProducts).toBe(false)
  })

  it('製品ごとに1エントリを作り、象限別にも引ける', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(0)
    game.segmentShares.ai = 20 // 花形
    game.segmentShares.consumer = 0.1 // 問題児
    game.products = [
      makeProduct({ id: 1, name: 'A', segmentId: 'ai' }),
      makeProduct({ id: 2, name: 'B', segmentId: 'consumer' }),
    ]

    const view = buildPpmView(game)

    expect(view.hasProducts).toBe(true)
    expect(view.entries).toHaveLength(2)
    expect(view.byQuadrant.star.map(e => e.productName)).toEqual(['A'])
    expect(view.byQuadrant.question_mark.map(e => e.productName)).toEqual(['B'])
    expect(view.byQuadrant.dog).toEqual([])
  })

  it('同じセグメントの製品は同じ象限に入る', () => {
    const game = getGame()
    ensureSegmentShares(game)
    setElapsedMonths(0)
    game.segmentShares.ai = 20
    game.products = [
      makeProduct({ id: 1, name: 'A', segmentId: 'ai' }),
      makeProduct({ id: 2, name: 'B', segmentId: 'ai' }),
    ]

    const view = buildPpmView(game)

    expect(view.byQuadrant.star).toHaveLength(2)
  })
})

// ============================================================
// Wave 3-C: 撤退
// ============================================================
describe('retireProduct', () => {
  it('製品を畳むと products から消える', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [
      makeProduct({ id: 1, name: '負け犬A' }),
      makeProduct({ id: 2, name: '主力B' }),
    ]

    const result = retireProduct(1)

    expect(result.success).toBe(true)
    expect(result.productName).toBe('負け犬A')
    expect(game.products.map(p => p.id)).toEqual([2])
  })

  it('開発部の従業員のストレスが下がる（保守負荷の解放）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1 })]
    game.employees = [
      {
        id: 1, name: '開発 太郎', personalityKey: 'logical',
        abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
        temperament: {
          boldness: 50, bravery: 50, cooperation: 50, creativity: 50,
          conscientiousness: 50, emotionalStability: 50, sociability: 50, cautiousness: 50,
        },
        subTraits: [], hiddenTrait: 'none', hiddenTraitRevealed: false, joinedTurn: 1,
        motivation: 60, salary: 300_000, department: 'development', position: 'staff',
        qualification: null, skillPoints: 0, unlockedSkills: [], growthHistory: [], stress: 60,
      },
      {
        id: 2, name: '営業 花子', personalityKey: 'logical',
        abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
        temperament: {
          boldness: 50, bravery: 50, cooperation: 50, creativity: 50,
          conscientiousness: 50, emotionalStability: 50, sociability: 50, cautiousness: 50,
        },
        subTraits: [], hiddenTrait: 'none', hiddenTraitRevealed: false, joinedTurn: 1,
        motivation: 60, salary: 300_000, department: 'sales', position: 'staff',
        qualification: null, skillPoints: 0, unlockedSkills: [], growthHistory: [], stress: 60,
      },
    ] as any

    retireProduct(1)

    expect(game.employees[0].stress).toBeLessThan(60)
    // 開発部以外は変わらない（保守負荷を負っていない）
    expect(game.employees[1].stress).toBe(60)
  })

  it('ストレスは0未満にならない', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1 })]
    game.employees = [{ id: 1, name: 'A', department: 'development', stress: 3, motivation: 50 }] as any

    retireProduct(1)

    expect(game.employees[0].stress).toBe(0)
  })

  it('存在しない製品IDなら失敗し、状態を変えない', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1 })]

    const result = retireProduct(999)

    expect(result.success).toBe(false)
    expect(game.products).toHaveLength(1)
  })

  it('最後の1本でも撤退できる（禁止しない）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.products = [makeProduct({ id: 1 })]

    expect(retireProduct(1).success).toBe(true)
    expect(game.products).toHaveLength(0)
  })

  it('撤退してもそのセグメントのシェアは即座には消えない（月次で減衰する）', () => {
    const game = getGame()
    ensureSegmentShares(game)
    game.segmentShares.ai = 12
    game.products = [makeProduct({ id: 1, segmentId: 'ai' })]

    retireProduct(1)

    expect(game.segmentShares.ai).toBe(12)
  })
})
