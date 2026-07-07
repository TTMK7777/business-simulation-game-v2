// Sprint E: Coachmark DOM 層
// CoachmarkManager (純ロジック) の CoachmarkHost 実装。
// - 要素待機: querySelector 即時 → MutationObserver + 複数フレーム rAF → タイムアウトでスキップ
// - 位置追従: ResizeObserver + window resize / orientationchange / scroll (capture)
// - 可視化: IntersectionObserver で非可視なら scrollIntoView
// - 旧チュートリアル (全画面 overlay) と違い、ターゲット型 tip はページ操作を一切ブロックしない
//   (中央カード型のみ backdrop = 集中モード)

import { getGame } from '../store/gameStore'
import { COACHMARKS, COACHMARK_ENTRY_ID, type CoachmarkDef, type CoachmarkReward } from '../config/coachmarks'
import { CoachmarkManager, type CoachmarkHost } from '../managers/CoachmarkManager'
import { calculatePosition } from './coachmarkPosition'
import { escapeHtml } from './escape'

const TARGET_WAIT_TIMEOUT_MS = 8000
const TIP_ID = 'coachmarkTip'
const BACKDROP_ID = 'coachmarkBackdrop'

let manager: CoachmarkManager | null = null
let cleanupFns: Array<() => void> = []
let waitToken = 0 // 表示世代トークン (古い waitForTarget の解決を無効化)

// ============================================
// 要素待機 (MutationObserver + 複数フレーム + タイムアウト)
// ============================================

function waitForTarget(selector: string, timeoutMs = TARGET_WAIT_TIMEOUT_MS): Promise<Element | null> {
    return new Promise(resolve => {
        const immediate = document.querySelector(selector)
        if (immediate) {
            resolve(immediate)
            return
        }

        let done = false
        const finish = (el: Element | null) => {
            if (done) return
            done = true
            observer?.disconnect()
            clearTimeout(timer)
            resolve(el)
        }

        // MutationObserver: DOM 追加を監視
        let observer: MutationObserver | null = null
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(() => {
                const el = document.querySelector(selector)
                if (el) finish(el)
            })
            observer.observe(document.body, { childList: true, subtree: true, attributes: true })
        }

        // 複数フレームの再チェック (描画タイミング差の吸収)
        let frames = 0
        const raf = typeof requestAnimationFrame !== 'undefined'
            ? requestAnimationFrame
            : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number
        const checkFrame = () => {
            if (done) return
            const el = document.querySelector(selector)
            if (el) {
                finish(el)
                return
            }
            if (++frames < 10) raf(checkFrame)
        }
        raf(checkFrame)

        const timer = setTimeout(() => finish(null), timeoutMs)
    })
}

// ============================================
// CoachmarkHost 実装 (描画)
// ============================================

function removeTipDom(): void {
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
    document.getElementById(TIP_ID)?.remove()
    document.getElementById(BACKDROP_ID)?.remove()
    document.querySelectorAll('.coachmark-highlight').forEach(el => el.classList.remove('coachmark-highlight'))
}

function renderTipElement(def: CoachmarkDef, targeted: boolean): HTMLElement {
    const tip = document.createElement('div')
    tip.id = TIP_ID
    tip.className = targeted ? 'coachmark-tip' : 'coachmark-tip coachmark-tip-center'
    tip.setAttribute('role', 'dialog')
    tip.setAttribute('aria-label', def.title)

    const rewardHtml = def.reward
        ? `<div class="coachmark-reward">🎁 報酬: ${def.reward.type === 'money'
            ? `${(def.reward.value / 10000).toFixed(0)}万円`
            : `ブランド力+${def.reward.value}`}</div>`
        : ''
    const actionHtml = def.action
        ? `<div class="coachmark-hint">👆 この操作を実行して進む</div>`
        : `<button type="button" class="coachmark-next-btn">次へ</button>`

    tip.innerHTML = `
        ${targeted ? '<div class="coachmark-arrow"></div>' : ''}
        <div class="coachmark-emoji">${escapeHtml(def.emoji)}</div>
        <div class="coachmark-title">${escapeHtml(def.title)}</div>
        <div class="coachmark-description">${escapeHtml(def.description)}</div>
        ${rewardHtml}
        ${actionHtml}
        <button type="button" class="coachmark-skip-btn">チュートリアルをスキップ</button>
    `

    tip.querySelector('.coachmark-next-btn')?.addEventListener('click', () => manager?.advance())
    tip.querySelector('.coachmark-skip-btn')?.addEventListener('click', () => manager?.skipAll())
    return tip
}

function positionTip(tip: HTMLElement, target: Element): void {
    const rect = target.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()
    const pos = calculatePosition(
        { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        { width: tipRect.width, height: tipRect.height },
        { width: window.innerWidth, height: window.innerHeight }
    )
    tip.style.left = `${pos.left}px`
    tip.style.top = `${pos.top}px`
    tip.dataset.placement = pos.placement
    const arrow = tip.querySelector<HTMLElement>('.coachmark-arrow')
    if (arrow) arrow.style.left = `${pos.arrowLeft}px`
}

function showTargetedTip(def: CoachmarkDef, target: Element): void {
    target.classList.add('coachmark-highlight')

    const tip = renderTipElement(def, true)
    document.body.appendChild(tip)
    positionTip(tip, target)

    // 位置追従: resize / orientationchange / scroll / ResizeObserver
    const reposition = () => positionTip(tip, target)
    window.addEventListener('resize', reposition)
    window.addEventListener('orientationchange', reposition)
    document.addEventListener('scroll', reposition, { capture: true, passive: true })
    cleanupFns.push(() => {
        window.removeEventListener('resize', reposition)
        window.removeEventListener('orientationchange', reposition)
        document.removeEventListener('scroll', reposition, { capture: true })
    })

    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(reposition)
        ro.observe(target)
        ro.observe(document.body)
        cleanupFns.push(() => ro.disconnect())
    }

    // 非可視なら視界内へスクロール
    if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => !e.isIntersecting)) {
                target.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }
            io.disconnect()
        })
        io.observe(target)
        cleanupFns.push(() => io.disconnect())
    }
}

function showCenterTip(def: CoachmarkDef): void {
    // 集中モード: backdrop でページ操作を一時ブロック (welcome / complete 等、操作不要の説明のみ)
    const backdrop = document.createElement('div')
    backdrop.id = BACKDROP_ID
    backdrop.className = 'coachmark-backdrop'
    document.body.appendChild(backdrop)

    const tip = renderTipElement(def, false)
    document.body.appendChild(tip)
}

const domHost: CoachmarkHost = {
    showTip(def: CoachmarkDef): void {
        removeTipDom()
        const token = ++waitToken

        if (!def.targetSelector) {
            showCenterTip(def)
            return
        }

        waitForTarget(def.targetSelector).then(target => {
            if (token !== waitToken) return // 世代切替済み (モーダル退避等)
            if (manager?.active !== def.id) return
            if (!target) {
                // ターゲット不在 → 詰まり防止のためスキップ扱いで先へ
                console.warn(`[coachmark] target not found, skipping: ${def.id} (${def.targetSelector})`)
                manager?.skipActive()
                return
            }
            showTargetedTip(def, target)
        })
    },

    hideTip(_id: string): void {
        waitToken++
        removeTipDom()
    },

    grantReward(reward: CoachmarkReward): void {
        const game = getGame()
        if (reward.type === 'money') {
            game.money += reward.value
        } else {
            game.brandPower += reward.value
        }
        ;(window as any).updateDisplay?.()
    },
}

// ============================================
// 公開 API
// ============================================

/**
 * Coachmark システムを初期化する。
 * ロード時に game.tutorialV2 オブジェクトが差し替わるため、
 * start/resume のたびに manager を再構築して最新参照に束ねる (古い tip DOM も除去)
 */
export function initCoachmarks(): void {
    waitToken++
    removeTipDom()
    const game = getGame()
    manager = new CoachmarkManager(game.tutorialV2, COACHMARKS, domHost)
}

/** 新規ゲーム開始時: welcome から開始 */
export function startCoachmarks(): void {
    initCoachmarks()
    manager!.start(COACHMARK_ENTRY_ID)
}

/** セーブ復元時: queue/pendingId の続きから再開 */
export function resumeCoachmarks(): void {
    initCoachmarks()
    manager!.resume()
}

/** ゲーム内アクション発生の通知 (panel:xxx / hire_employee 等) */
export function notifyCoachmarkAction(action: string): void {
    manager?.notifyAction(action)
}

/** 条件発火型 coachmark の投入 (初黒字等) */
export function enqueueCoachmark(id: string): void {
    manager?.enqueue(id)
}

/** モーダル排他制御 (modals.ts から呼ばれる) */
export function coachmarkModalOpened(): void {
    manager?.pauseForModal()
}

export function coachmarkModalClosed(): void {
    manager?.resumeAfterModal()
}
