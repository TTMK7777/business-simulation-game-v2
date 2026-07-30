/**
 * WeeklyEventManager.ts のユニットテスト（Wave 2-A/C: 週次ミニイベント基盤 + 決裁カード注入）
 *
 * テスト対象:
 * - isSettlementWeek(): 決算週（第4週）の判定
 * - shouldOfferWeeklyEvent(): 管理モードの決算週以外でのみ提示、週1件まで
 * - buildImpactLabel(): 「数字への影響」の明示（設計制約）
 * - pickWeeklyEventKind(): 種別抽選と、対象不在時のフォールバック
 * - generateWeeklyEvent(): 種別ごとのイベント生成（decision は DocumentManager 資産を注入）
 * - resolveWeeklyEvent(): 効果適用・決裁カードの理論タグ発火（管理モードでも）
 * - expireWeeklyEvent(): 未対応のまま流れた場合の失効処理
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  isSettlementWeek,
  shouldOfferWeeklyEvent,
  buildImpactLabel,
  pickWeeklyEventKind,
  generateWeeklyEvent,
  resolveWeeklyEvent,
  expireWeeklyEvent,
} from '../lib/managers/WeeklyEventManager'
import { getGame, resetGameState } from '../lib/store/gameStore'
import { HR_WEEKLY_EVENTS, MARKET_WEEKLY_EVENTS } from '../lib/config/weeklyEvents'
import type { Employee } from '../lib/types/index'

beforeEach(() => {
  resetGameState()
})

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    name: 'テスト 太郎',
    age: 30,
    personalityKey: 'logical',
    abilities: { technical: 50, sales: 50, planning: 50, management: 50 },
    temperament: {
      boldness: 50, bravery: 50, cooperation: 50, creativity: 50,
      conscientiousness: 50, emotionalStability: 50, sociability: 50, cautiousness: 50,
    },
    subTraits: [],
    hiddenTrait: 'none',
    hiddenTraitRevealed: false,
    joinedTurn: 1,
    motivation: 70,
    salary: 300_000,
    department: 'development',
    position: 'staff',
    qualification: null,
    skillPoints: 0,
    unlockedSkills: [],
    growthHistory: [],
    stress: 0,
    lastTrainingTurn: 1,
    performanceMultiplier: 1,
    ...overrides,
  }
}

/** 管理モードでイベントが出せる状態にする */
function setupManagementGame(overrides: Record<string, any> = {}) {
  const game = getGame()
  game.gameMode = 'management'
  game.week = 1
  game.turn = 5
  game.money = 10_000_000
  game.employees = [makeEmployee()]
  game.currentWeeklyEvent = null
  Object.assign(game, overrides)
  return game
}

// ============================================================
// 決算週の判定 / 提示条件
// ============================================================
describe('isSettlementWeek', () => {
  it('第4週が決算週', () => {
    expect(isSettlementWeek(1)).toBe(false)
    expect(isSettlementWeek(2)).toBe(false)
    expect(isSettlementWeek(3)).toBe(false)
    expect(isSettlementWeek(4)).toBe(true)
  })
})

describe('shouldOfferWeeklyEvent', () => {
  it('管理モードの決算週以外なら提示する', () => {
    const game = setupManagementGame({ week: 2 })
    expect(shouldOfferWeeklyEvent(game)).toBe(true)
  })

  it('決算週は提示しない（月次決算に集中させる）', () => {
    const game = setupManagementGame({ week: 4 })
    expect(shouldOfferWeeklyEvent(game)).toBe(false)
  })

  it('社長モードは対象外（決裁は CEO デスクの本編なので二重提示しない）', () => {
    const game = setupManagementGame({ gameMode: 'ceo' })
    expect(shouldOfferWeeklyEvent(game)).toBe(false)
  })

  it('倒産・ゲームオーバー中は提示しない', () => {
    expect(shouldOfferWeeklyEvent(setupManagementGame({ isBankrupt: true }))).toBe(false)
    resetGameState()
    expect(shouldOfferWeeklyEvent(setupManagementGame({ isGameOver: true }))).toBe(false)
  })

  it('従業員がいなければ提示しない（提出者・対象者が作れない）', () => {
    const game = setupManagementGame({ employees: [] })
    expect(shouldOfferWeeklyEvent(game)).toBe(false)
  })
})

// ============================================================
// 数字への影響の明示（設計制約）
// ============================================================
describe('buildImpactLabel', () => {
  it('効果なしは「変化なし」と明示する', () => {
    expect(buildImpactLabel({})).toBe('変化なし')
  })

  it('金額は万円単位で符号付き表示になる', () => {
    expect(buildImpactLabel({ money: -300_000 })).toContain('資金 -30万円')
    expect(buildImpactLabel({ money: 1_000_000 })).toContain('資金 +100万円')
  })

  it('複数指標はすべて列挙される', () => {
    const label = buildImpactLabel({ money: -800_000, brandPower: 4, marketShare: 0.8 })
    expect(label).toContain('資金 -80万円')
    expect(label).toContain('ブランド +4')
    expect(label).toContain('シェア +0.8')
  })

  it('モチベーション・ストレスも明示される', () => {
    const label = buildImpactLabel({ motivation: 12, stress: -15 })
    expect(label).toContain('モチベ +12')
    expect(label).toContain('ストレス -15')
  })

  it('config の全選択肢が「数字への影響」を持つか、明示的に変化なしである', () => {
    for (const def of [...HR_WEEKLY_EVENTS, ...MARKET_WEEKLY_EVENTS]) {
      for (const opt of def.options) {
        expect(buildImpactLabel(opt.effect).length).toBeGreaterThan(0)
      }
    }
  })
})

// ============================================================
// 種別抽選
// ============================================================
describe('pickWeeklyEventKind', () => {
  it('モチベーションが落ちた従業員がいなければ hr は選ばれない', () => {
    const game = setupManagementGame({ employees: [makeEmployee({ motivation: 95 })] })
    const kinds = new Set<string>()
    for (let i = 0; i < 100; i++) {
      kinds.add(pickWeeklyEventKind(game, () => i / 100))
    }
    expect(kinds.has('hr')).toBe(false)
    expect(kinds.size).toBeGreaterThan(0)
  })

  it('モチベーションが落ちた従業員がいれば hr も選択肢に入る', () => {
    const game = setupManagementGame({ employees: [makeEmployee({ motivation: 40 })] })
    const kinds = new Set<string>()
    for (let i = 0; i < 100; i++) {
      kinds.add(pickWeeklyEventKind(game, () => i / 100))
    }
    expect(kinds.has('hr')).toBe(true)
  })

  it('乱数0では最優先の種別（decision）が選ばれる', () => {
    const game = setupManagementGame()
    expect(pickWeeklyEventKind(game, () => 0)).toBe('decision')
  })
})

// ============================================================
// イベント生成
// ============================================================
describe('generateWeeklyEvent', () => {
  it('決算週には生成しない', () => {
    setupManagementGame({ week: 4 })
    expect(generateWeeklyEvent(() => 0)).toBeNull()
  })

  it('decision イベントは書類を1件生成して documentQueue に積む（Wave 2-C）', () => {
    const game = setupManagementGame()
    const event = generateWeeklyEvent(() => 0)!

    expect(event.kind).toBe('decision')
    expect(event.documentId).toBeTruthy()
    expect(game.documentQueue).toHaveLength(1)
    expect(game.documentQueue[0].id).toBe(event.documentId)
    // 承認・却下のみ（差し戻し/調査は CEO モード専用機能なので出さない）
    expect(event.options.map(o => o.id).sort()).toEqual(['approve', 'reject'])
  })

  it('decision の選択肢にも金額が明示される', () => {
    setupManagementGame()
    const event = generateWeeklyEvent(() => 0)!
    expect(event.options.find(o => o.id === 'approve')!.impact).toContain('万円')
  })

  it('hr イベントは対象従業員を持ち、説明に名前が差し込まれる', () => {
    setupManagementGame({ employees: [makeEmployee({ id: 7, name: '低調 花子', motivation: 35 })] })
    // hr が選ばれるまで乱数をずらして探す
    let event = null
    for (let i = 0; i < 100 && !event; i++) {
      resetGameState()
      setupManagementGame({ employees: [makeEmployee({ id: 7, name: '低調 花子', motivation: 35 })] })
      const candidate = generateWeeklyEvent(() => i / 100)
      if (candidate?.kind === 'hr') event = candidate
    }

    expect(event).not.toBeNull()
    expect(event!.targetEmployeeId).toBe(7)
    expect(event!.description).toContain('低調 花子')
    expect(event!.description).not.toContain('{name}')
  })

  it('生成したイベントは game.currentWeeklyEvent に保持される（週1件の担保）', () => {
    const game = setupManagementGame()
    const event = generateWeeklyEvent(() => 0)!
    expect(game.currentWeeklyEvent?.title).toBe(event.title)
    // すでに提示済みなら追加提示しない
    expect(shouldOfferWeeklyEvent(game)).toBe(false)
  })
})

// ============================================================
// イベント解決
// ============================================================
describe('resolveWeeklyEvent', () => {
  it('市場イベントの効果が state に適用される', () => {
    const game = setupManagementGame()
    game.currentWeeklyEvent = {
      kind: 'market',
      defId: 'market_ad_slot',
      emoji: '📣',
      title: '広告枠の空き',
      description: 'テスト',
      options: [],
      turn: game.turn,
    }
    const before = { money: game.money, brand: game.brandPower, share: game.marketShare }

    const result = resolveWeeklyEvent('buy')!

    expect(game.money).toBe(before.money - 800_000)
    expect(game.brandPower).toBeCloseTo(before.brand + 4, 10)
    expect(game.marketShare).toBeCloseTo(before.share + 0.8, 10)
    expect(result.impacts.length).toBeGreaterThan(0)
    expect(game.currentWeeklyEvent).toBeNull()
  })

  it('hr イベントは対象従業員だけに効果が及ぶ', () => {
    const game = setupManagementGame({
      employees: [
        makeEmployee({ id: 1, motivation: 40, stress: 60 }),
        makeEmployee({ id: 2, motivation: 40, stress: 60 }),
      ],
    })
    game.currentWeeklyEvent = {
      kind: 'hr',
      defId: 'hr_one_on_one',
      emoji: '🗣️',
      title: '面談の申し出',
      description: 'テスト',
      options: [],
      targetEmployeeId: 1,
      turn: game.turn,
    }

    resolveWeeklyEvent('talk')

    expect(game.employees[0].motivation).toBe(52)
    expect(game.employees[0].stress).toBe(45)
    // 対象外は不変
    expect(game.employees[1].motivation).toBe(40)
    expect(game.employees[1].stress).toBe(60)
  })

  it('モチベーション・ストレスはクランプされる', () => {
    const game = setupManagementGame({
      employees: [makeEmployee({ id: 1, motivation: 95, stress: 5 })],
    })
    game.currentWeeklyEvent = {
      kind: 'hr', defId: 'hr_one_on_one', emoji: '🗣️', title: 't', description: 'd',
      options: [], targetEmployeeId: 1, turn: game.turn,
    }

    resolveWeeklyEvent('talk')

    expect(game.employees[0].motivation).toBe(100)
    expect(game.employees[0].stress).toBe(0)
  })

  it('決裁カードは processVerdict を通り、理論タグが管理モードでも発火する（Wave 2-C）', () => {
    const game = setupManagementGame()
    const event = generateWeeklyEvent(() => 0)!
    expect(event.kind).toBe('decision')

    const result = resolveWeeklyEvent('approve')!

    expect(game.documentQueue).toHaveLength(0)
    expect(game.documentHistory).toHaveLength(1)
    expect(game.documentHistory[0].verdict).toBe('approve')
    // 理論タグは書類の性質次第で付かないこともあるが、付いた場合は図鑑に解禁される
    if (result.theoryTag) {
      expect(game.unlockedTheories).toContain(result.theoryTag.theoryId)
    }
    expect(game.currentWeeklyEvent).toBeNull()
  })

  it('社長モードのステータス(ceo)が無くても決裁でクラッシュしない', () => {
    const game = setupManagementGame()
    expect(game.ceo).toBeFalsy()
    generateWeeklyEvent(() => 0)

    expect(() => resolveWeeklyEvent('reject')).not.toThrow()
    expect(game.documentStats.totalProcessed).toBe(1)
  })

  it('未知の選択肢や提示中イベントなしなら null', () => {
    const game = setupManagementGame()
    expect(resolveWeeklyEvent('approve')).toBeNull()

    generateWeeklyEvent(() => 0)
    expect(resolveWeeklyEvent('unknown-option')).toBeNull()
    // イベントは消費されない
    expect(game.currentWeeklyEvent).not.toBeNull()
  })
})

// ============================================================
// 失効
// ============================================================
describe('expireWeeklyEvent', () => {
  it('未対応の決裁カードは失効し、キューから消えて提出者のモチベーションが下がる', () => {
    const game = setupManagementGame()
    generateWeeklyEvent(() => 0)
    const doc = game.documentQueue[0]
    const submitter = game.employees.find(e => e.id === doc.submitter.employeeId)
    const before = submitter?.motivation

    const expired = expireWeeklyEvent()

    expect(expired).toBe(true)
    expect(game.documentQueue).toHaveLength(0)
    expect(game.currentWeeklyEvent).toBeNull()
    if (submitter && before !== undefined) {
      expect(submitter.motivation).toBeLessThan(before)
    }
  })

  it('提示中のイベントが無ければ何もしない', () => {
    setupManagementGame()
    expect(expireWeeklyEvent()).toBe(false)
  })
})
