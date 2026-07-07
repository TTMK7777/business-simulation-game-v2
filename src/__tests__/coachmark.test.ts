/**
 * Sprint E: チュートリアル v2 (Coachmark) のユニットテスト
 *
 * テスト対象:
 * - CoachmarkManager (純粋状態機械・DOM 非依存):
 *   順序進行 / action 完了 / priority 割込 / 保存復元 / モーダル排他 /
 *   ロールバックフラグ / 旧セーブ互換 / スキップ
 * - calculatePosition (純関数): 上下反転 / viewport clamp / 矢印追従
 *
 * DOM 層 (ui/coachmark.ts の要素待機・ResizeObserver 追従) は
 * 実ブラウザ E2E で検証する (jsdom 依存を持ち込まない方針)。
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CoachmarkManager, type CoachmarkHost } from '../lib/managers/CoachmarkManager'
import { COACHMARKS, COACHMARK_ENTRY_ID, type CoachmarkDef, type CoachmarkReward } from '../lib/config/coachmarks'
import { calculatePosition } from '../lib/ui/coachmarkPosition'
import type { TutorialV2State } from '../lib/types'

// ============================================
// テストヘルパー
// ============================================

function freshState(overrides: Partial<TutorialV2State> = {}): TutorialV2State {
    return {
        enabled: true,
        disabled: false,
        shownIds: [],
        pendingId: null,
        queue: [],
        version: 1,
        ...overrides,
    }
}

interface HostLog {
    shown: string[]
    hidden: string[]
    rewards: CoachmarkReward[]
}

function mockHost(): { host: CoachmarkHost; log: HostLog } {
    const log: HostLog = { shown: [], hidden: [], rewards: [] }
    const host: CoachmarkHost = {
        showTip: (def: CoachmarkDef) => log.shown.push(def.id),
        hideTip: (id: string) => log.hidden.push(id),
        grantReward: (r: CoachmarkReward) => log.rewards.push(r),
    }
    return { host, log }
}

// ============================================
// CoachmarkManager: 開始ガード
// ============================================

describe('CoachmarkManager: 開始ガード', () => {
    it('enabled=true で start すると welcome が表示される', () => {
        const { host, log } = mockHost()
        const m = new CoachmarkManager(freshState(), COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        expect(log.shown).toEqual(['welcome'])
        expect(m.active).toBe('welcome')
    })

    it('disabled=true (ロールバックフラグ) では何も表示しない', () => {
        const { host, log } = mockHost()
        const m = new CoachmarkManager(freshState({ disabled: true }), COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        expect(log.shown).toEqual([])
        expect(m.active).toBeNull()
    })

    it('enabled=false (旧セーブ互換: tutorialCompleted 由来) では何も表示しない', () => {
        const { host, log } = mockHost()
        const m = new CoachmarkManager(freshState({ enabled: false }), COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        expect(log.shown).toEqual([])
    })
})

// ============================================
// CoachmarkManager: 進行・完了
// ============================================

describe('CoachmarkManager: 進行と完了', () => {
    let state: TutorialV2State
    let host: CoachmarkHost
    let log: HostLog
    let m: CoachmarkManager

    beforeEach(() => {
        state = freshState()
        const mock = mockHost()
        host = mock.host
        log = mock.log
        m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID) // welcome 表示
    })

    it('action なし tip は advance() で完了し next が連鎖表示される', () => {
        m.advance() // welcome 完了 → next: tab_hr
        expect(state.shownIds).toContain('welcome')
        expect(log.shown).toEqual(['welcome', 'tab_hr'])
        expect(m.active).toBe('tab_hr')
    })

    it('action 付き tip は notifyAction の一致で完了し報酬が付与される', () => {
        m.advance() // → tab_hr (action: panel:employees)
        m.notifyAction('panel:employees') // tab_hr 完了 → action_hire 表示
        expect(m.active).toBe('action_hire')
        m.notifyAction('hire_employee') // action_hire 完了 (reward money 100000)
        expect(log.rewards).toContainEqual({ type: 'money', value: 100000 })
        expect(m.active).toBe('tab_products')
    })

    it('action 不一致の通知は無視される', () => {
        m.advance() // → tab_hr
        m.notifyAction('develop_product')
        expect(m.active).toBe('tab_hr')
        expect(state.shownIds).not.toContain('tab_hr')
    })

    it('action 付き tip は advance() では完了しない (誤クリック防御)', () => {
        m.advance() // → tab_hr (action あり)
        m.advance()
        expect(m.active).toBe('tab_hr')
    })

    it('全 11 coachmark が定義され、welcome から complete まで連鎖が繋がっている', () => {
        expect(Object.keys(COACHMARKS)).toHaveLength(11)
        // チェーンを辿って complete に到達することを確認
        const visited: string[] = []
        let cur: string | undefined = COACHMARK_ENTRY_ID
        while (cur && !visited.includes(cur)) {
            visited.push(cur)
            cur = COACHMARKS[cur]?.next
        }
        expect(visited[visited.length - 1]).toBe('complete')
        // チェーン外は条件発火型 cond_first_profit のみ
        const offChain = Object.keys(COACHMARKS).filter(id => !visited.includes(id))
        expect(offChain).toEqual(['cond_first_profit'])
    })
})

// ============================================
// CoachmarkManager: キュー・priority・重複
// ============================================

describe('CoachmarkManager: キューと priority', () => {
    it('priority が高い coachmark (cond_first_profit=5) が通常より先に表示される', () => {
        const state = freshState()
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID) // welcome 表示中
        m.enqueue('cond_first_profit') // 割込み投入 (queue 待機)
        m.advance() // welcome 完了 → next: tab_hr も enqueue されるが…
        // priority 5 の cond_first_profit が先に表示される
        expect(log.shown).toEqual(['welcome', 'cond_first_profit'])
        m.advance() // cond_first_profit 完了 (action なし)
        expect(log.shown).toEqual(['welcome', 'cond_first_profit', 'tab_hr'])
    })

    it('表示済み (shownIds) の coachmark は再 enqueue されない', () => {
        const state = freshState({ shownIds: ['cond_first_profit'] })
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.enqueue('cond_first_profit')
        expect(state.queue).toEqual([])
        expect(log.shown).toEqual([])
    })

    it('キュー重複・未知 ID の enqueue は無視される', () => {
        const state = freshState({ enabled: true })
        const { host } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID) // welcome active
        m.enqueue('tab_market')
        m.enqueue('tab_market') // 重複
        m.enqueue('unknown_id') // 未知
        expect(state.queue).toEqual(['tab_market'])
    })
})

// ============================================
// CoachmarkManager: モーダル排他・保存復元
// ============================================

describe('CoachmarkManager: モーダル排他と保存復元', () => {
    it('pauseForModal で退避し resumeAfterModal で復帰する', () => {
        const state = freshState()
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        m.pauseForModal()
        expect(log.hidden).toContain('welcome')
        expect(state.pendingId).toBe('welcome')
        expect(m.active).toBeNull()
        m.resumeAfterModal()
        expect(state.pendingId).toBeNull()
        expect(log.shown).toEqual(['welcome', 'welcome']) // 再表示
    })

    it('退避中でも action 通知で完了する (結果モーダル→通知の順序ずれ対策)', () => {
        const state = freshState()
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        m.advance() // → tab_hr (action: panel:employees)
        m.pauseForModal() // モーダルが先に開く
        m.notifyAction('panel:employees') // 退避中に完了条件が届く
        expect(state.shownIds).toContain('tab_hr')
        expect(state.pendingId).toBeNull()
        m.resumeAfterModal()
        // tab_hr は再表示されず、次の action_hire が表示される
        expect(log.shown.filter(id => id === 'tab_hr')).toHaveLength(1)
        expect(m.active).toBe('action_hire')
    })

    it('セーブ復元: queue/shownIds を引き継いだ新インスタンスが続きから再開する', () => {
        // セッション1: welcome 完了、tab_hr 表示中に保存 (queue に残る想定は pendingId 経由)
        const saved = freshState({
            shownIds: ['welcome'],
            queue: ['tab_hr'],
        })
        const { host, log } = mockHost()
        const m = new CoachmarkManager(saved, COACHMARKS, host)
        m.resume()
        expect(log.shown).toEqual(['tab_hr'])
        expect(m.active).toBe('tab_hr')
    })

    it('skipAll でチュートリアル全体が終了し enabled=false になる', () => {
        const state = freshState()
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID) // welcome 表示
        m.enqueue('tab_market')     // 待機中も積んでおく
        m.skipAll()
        expect(state.enabled).toBe(false)
        expect(state.queue).toEqual([])
        expect(log.hidden).toContain('welcome')
        // 以後 enqueue しても表示されない
        m.enqueue('tab_market')
        expect(state.queue).toEqual([])
    })

    it('skipActive はタイムアウト時のフォールバック: 報酬なしで次へ進む', () => {
        const state = freshState()
        const { host, log } = mockHost()
        const m = new CoachmarkManager(state, COACHMARKS, host)
        m.start(COACHMARK_ENTRY_ID)
        m.advance() // → tab_hr
        m.notifyAction('panel:employees') // → action_hire (reward あり)
        m.skipActive() // ターゲット不在スキップ
        expect(state.shownIds).toContain('action_hire')
        expect(log.rewards).not.toContainEqual({ type: 'money', value: 100000 })
        expect(m.active).toBe('tab_products') // チェーンは継続
    })
})

// ============================================
// calculatePosition: 位置計算 (純関数)
// ============================================

describe('calculatePosition: Coachmark 位置計算', () => {
    const tip = { width: 320, height: 160 }
    const viewport = { width: 400, height: 800 }

    it('下に収まる場合はターゲット直下 (placement: bottom)', () => {
        const target = { top: 100, left: 40, width: 80, height: 40 }
        const pos = calculatePosition(target, tip, viewport)
        expect(pos.placement).toBe('bottom')
        expect(pos.top).toBe(100 + 40 + 8)
    })

    it('下に収まらない場合は上に反転 (placement: top)', () => {
        const target = { top: 700, left: 40, width: 80, height: 40 }
        const pos = calculatePosition(target, tip, viewport)
        expect(pos.placement).toBe('top')
        expect(pos.top).toBe(700 - 8 - 160)
    })

    it('上下どちらも収まらない小画面では viewport 内に clamp される', () => {
        const smallViewport = { width: 400, height: 200 }
        const target = { top: 90, left: 40, width: 80, height: 40 }
        const pos = calculatePosition(target, tip, smallViewport)
        // fitsBelow/fitsAbove とも false → bottom のまま
        // top = clamp(90+40+8, [8, 200-160-8=32]) = 32
        expect(pos.top).toBe(32)
    })

    it('横方向は viewport 内に clamp され、矢印はターゲット中心を指し続ける', () => {
        // ターゲットが左端 → tip は margin=8 に clamp、矢印は左寄り
        const target = { top: 100, left: 0, width: 40, height: 40 }
        const pos = calculatePosition(target, tip, viewport)
        expect(pos.left).toBe(8)
        expect(pos.arrowLeft).toBe(Math.max(20 - 8, 12)) // ターゲット中心(20) - tip左端(8)
    })

    it('右端ターゲットでも tip が viewport からはみ出さない', () => {
        const target = { top: 100, left: 360, width: 40, height: 40 }
        const pos = calculatePosition(target, tip, viewport)
        expect(pos.left + tip.width).toBeLessThanOrEqual(400 - 8)
        // 矢印は tip 内側 12px まででターゲット方向を指す
        expect(pos.arrowLeft).toBeLessThanOrEqual(320 - 12)
        expect(pos.arrowLeft).toBeGreaterThanOrEqual(12)
    })

    it('リサイズ後の再計算で位置が更新される (同一入力なら同一出力の純関数)', () => {
        // ターゲット中心 340: 幅400 では右端 clamp (72)、幅1200 では中心合わせ (180)
        const target = { top: 100, left: 300, width: 80, height: 40 }
        const a = calculatePosition(target, tip, { width: 400, height: 800 })
        const b = calculatePosition(target, tip, { width: 1200, height: 800 })
        expect(a).toEqual(calculatePosition(target, tip, { width: 400, height: 800 }))
        expect(a.left).toBe(72)  // 400 - 320 - 8
        expect(b.left).toBe(180) // 340 - 160
    })
})
