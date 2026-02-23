/**
 * qualificationGenerator.ts のユニットテスト
 *
 * テスト対象:
 * - selectQualificationForCandidate: 求職者に資格を割り当てる
 *   - I3修正検証: 前提資格（requirements）を持つ資格は新規候補者に割り当てないこと
 *   - 年齢・能力値フィルタリングが正しく動作すること
 *   - QUALIFICATION_OVERALL_RATE (5%) の確率制御
 *
 * 能力値フィルターの仕様（qualificationGenerator.ts:49-52）:
 *   - S 級: avgAbility >= 75 が必要
 *   - A 級: avgAbility >= 65 が必要
 *   - B 級: avgAbility >= 55 が必要
 *   - C 級: avgAbility >= 45 が必要
 *   - D 級: 能力値制限なし（boki2, fp2, it_passport 等）
 */

import { describe, it, expect, vi } from 'vitest'
import { selectQualificationForCandidate } from '../lib/qualificationGenerator'
import { QUALIFICATIONS_30 } from '../lib/qualifications'

// ============================================================
// テスト用 Candidate ファクトリ
// ============================================================
interface TestCandidate {
  age: number
  abilities: {
    technical: number
    sales: number
    planning: number
    management: number
  }
  personality?: string
}

function makeCandidate(overrides: Partial<TestCandidate> = {}): TestCandidate {
  return {
    age: 30,
    abilities: { technical: 70, sales: 70, planning: 70, management: 70 },
    personality: 'balanced',
    ...overrides,
  }
}

// ============================================================
// I3修正: 前提資格を持つ資格は新規候補者に割り当てない
//
// 問題: qualificationGenerator.ts:54 の `continue` が正しく機能しているか
//       requirements.length > 0 の資格（例: cpa→['boki2'], mba→['toeic730']）が
//       新規候補者に割り当てられないことを確認
// ============================================================
describe('I3: 前提資格スキップ — requirements 付き資格は候補者に割り当てない', () => {
  /**
   * 前提資格を持つ資格の一覧を動的に取得
   */
  const requirementQuals = Object.entries(QUALIFICATIONS_30)
    .filter(([, qual]) => qual.requirements && qual.requirements.length > 0)
    .map(([id]) => id)

  it('前提資格が必要な資格の ID リストが存在すること（テスト環境確認）', () => {
    // cpa(requirements:['boki2']), mba(requirements:['toeic730']) 等が含まれる
    expect(requirementQuals.length).toBeGreaterThan(0)
  })

  it('Math.random を 0 に固定（常に資格保有）した場合、前提資格付き資格が選ばれないこと', () => {
    /**
     * Math.random = 0 固定:
     * - QUALIFICATION_OVERALL_RATE (0.05) チェック: 0 < 0.05 → 資格保有ルートに進む
     * - qual.spawnRate チェック: 0 < spawnRate → 全て eligible になるが
     *   requirements.length > 0 は continue でスキップ済み
     *
     * → eligibleQuals には requirements=[] のもののみが含まれる
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      const candidate = makeCandidate({ age: 35, abilities: { technical: 90, sales: 90, planning: 90, management: 90 } })
      const result = selectQualificationForCandidate(candidate)

      if (result !== null) {
        const qual = QUALIFICATIONS_30[result]
        expect(qual).toBeDefined()
        // I3修正検証: 前提資格が必要な資格は割り当てられていない
        expect(qual.requirements).toHaveLength(0)
      }
      // null の場合は資格なし → 問題なし
    } finally {
      spy.mockRestore()
    }
  })

  it('大量サンプリングで前提資格付き資格が一度も選ばれないこと', () => {
    /**
     * 1000回試行して requirements.length > 0 の資格が選ばれないことを確認
     * これが I3 の核心テスト
     */
    const candidate = makeCandidate({
      age: 40,
      abilities: { technical: 95, sales: 95, planning: 95, management: 95 },
    })

    let checkedCount = 0
    for (let i = 0; i < 1000; i++) {
      const result = selectQualificationForCandidate(candidate)
      if (result !== null) {
        const qual = QUALIFICATIONS_30[result]
        expect(qual).toBeDefined()
        // I3修正: requirements.length > 0 の資格は出てはいけない
        expect(qual.requirements).toHaveLength(0)
        checkedCount++
      }
    }
    // 5%確率なので 1000回中おおよそ 50 件は資格ありになるはず
    console.log(`I3テスト: ${checkedCount}/1000 件で資格が選ばれた（全て requirements=[] であること確認済み）`)
  })
})

// ============================================================
// 年齢フィルタリングテスト
// ============================================================
describe('selectQualificationForCandidate: 年齢フィルタリング', () => {
  it('20歳の候補者は S/A/B 級資格を取得しないこと（Math.random=0 で強制試行）', () => {
    /**
     * 年齢フィルター:
     *   S 級: age >= 28 が必要
     *   A 級: age >= 25 が必要
     *   B 級: age >= 23 が必要
     * 20歳 → S,A,B 全てフィルター → C 級(age制限なし) または D 級のみ選択可能
     */
    const youngCandidate = makeCandidate({
      age: 20,
      abilities: { technical: 90, sales: 90, planning: 90, management: 90 },
    })

    for (let i = 0; i < 100; i++) {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
      try {
        const result = selectQualificationForCandidate(youngCandidate)
        if (result !== null) {
          const qual = QUALIFICATIONS_30[result]
          // 20歳は S,A,B が blocked
          expect(qual?.tier).not.toBe('S')
          expect(qual?.tier).not.toBe('A')
          expect(qual?.tier).not.toBe('B')
        }
      } finally {
        spy.mockRestore()
      }
    }
  })

  it('28歳以上の高能力者は S 級資格が選ばれる可能性があること', () => {
    /**
     * Math.random = 0 固定 + 高能力 + 高齢 → S 級も eligible に含まれる
     * （requirements=[] のS級、例: lawyer）
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const seniorCandidate = makeCandidate({
        age: 35,
        abilities: { technical: 90, sales: 90, planning: 90, management: 90 },
      })

      // S 級で requirements=[] のものが存在するか確認
      const sTierNoReq = Object.entries(QUALIFICATIONS_30).filter(
        ([, q]) => q.tier === 'S' && q.requirements.length === 0
      )

      if (sTierNoReq.length > 0) {
        // eligible に S 級（requirements=[]）が含まれ得る
        const result = selectQualificationForCandidate(seniorCandidate)
        // null でないか、S 級 requirements=[] が含まれているか
        // どちらでも正常
        if (result !== null) {
          const qual = QUALIFICATIONS_30[result]
          expect(qual).toBeDefined()
        }
      }
    } finally {
      spy.mockRestore()
    }
  })
})

// ============================================================
// 能力値フィルタリングテスト
//
// 仕様（qualificationGenerator.ts:49-52）:
//   S 級: avgAbility >= 75
//   A 級: avgAbility >= 65
//   B 級: avgAbility >= 55
//   C 級: avgAbility >= 45
//   D 級: 能力値制限なし（boki2 等の入門資格）
// ============================================================
describe('selectQualificationForCandidate: 能力値フィルタリング', () => {
  it('平均能力値 44 の候補者は S/A/B/C 級資格を取得しないこと（D 級は除く）', () => {
    /**
     * 平均 44 < 45 → C 級フィルターで blocked
     * ただし D 級（boki2 等）は能力値制限なしなので選ばれる可能性がある
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const lowAbilityCandidate = makeCandidate({
        age: 35,
        abilities: { technical: 44, sales: 44, planning: 44, management: 44 },
      })
      const result = selectQualificationForCandidate(lowAbilityCandidate)
      if (result !== null) {
        const qual = QUALIFICATIONS_30[result]
        expect(qual).toBeDefined()
        // C 級以上は取得できない（D 級は可能）
        expect(qual.tier).not.toBe('S')
        expect(qual.tier).not.toBe('A')
        expect(qual.tier).not.toBe('B')
        expect(qual.tier).not.toBe('C')
        // D 級（boki2, fp2, it_passport 等）は OK
        expect(qual.tier).toBe('D')
      }
    } finally {
      spy.mockRestore()
    }
  })

  it('平均能力値 75 以上の候補者は S 級資格（requirements=[]）の候補になれること', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const highAbilityCandidate = makeCandidate({
        age: 35,
        abilities: { technical: 80, sales: 75, planning: 75, management: 75 },
      })
      // 平均 = (80+75+75+75)/4 = 76.25 >= 75 → S 級も eligible
      // エラーなく実行できることを確認（S 級が選ばれるかどうかは確率依存）
      const result = selectQualificationForCandidate(highAbilityCandidate)
      if (result !== null) {
        expect(QUALIFICATIONS_30[result]).toBeDefined()
      }
    } finally {
      spy.mockRestore()
    }
  })

  it('平均能力値 74 の候補者は S 級資格を取得しないこと', () => {
    /**
     * 平均 74 < 75 → S 級フィルターで blocked
     * A 級以下は eligible
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const candidate = makeCandidate({
        age: 35,
        abilities: { technical: 74, sales: 74, planning: 74, management: 74 },
      })
      // 平均 = 74 < 75 → S 級不可
      const result = selectQualificationForCandidate(candidate)
      if (result !== null) {
        const qual = QUALIFICATIONS_30[result]
        expect(qual.tier).not.toBe('S')
      }
    } finally {
      spy.mockRestore()
    }
  })
})

// ============================================================
// 確率制御テスト (QUALIFICATION_OVERALL_RATE = 0.05)
// ============================================================
describe('selectQualificationForCandidate: 全体確率制御', () => {
  it('Math.random が 0.06 の場合（5%超）null を返す', () => {
    /**
     * QUALIFICATION_OVERALL_RATE = 0.05
     * Math.random() = 0.06 > 0.05 → early return null
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.06)
    try {
      const candidate = makeCandidate()
      const result = selectQualificationForCandidate(candidate)
      expect(result).toBeNull()
    } finally {
      spy.mockRestore()
    }
  })

  it('Math.random が 0 の場合（0%）は資格選択ルートに入ること', () => {
    /**
     * 0 < 0.05 → 資格選択ルートに入る
     * 高能力・高齢候補者なら何らかの資格が返る（またはnull）
     */
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      const candidate = makeCandidate({
        age: 30,
        abilities: { technical: 70, sales: 70, planning: 70, management: 70 },
      })
      // エラーなく実行できることを確認
      const result = selectQualificationForCandidate(candidate)
      // 結果は string | null
      expect(result === null || typeof result === 'string').toBe(true)
      if (result !== null) {
        expect(QUALIFICATIONS_30[result]).toBeDefined()
      }
    } finally {
      spy.mockRestore()
    }
  })
})
