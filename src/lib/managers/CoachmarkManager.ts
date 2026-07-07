// Sprint E: Coachmark 状態機械 (純粋ビジネスロジック・DOM 非依存)
// plan.md 決定事項「Manager = 純粋ビジネスロジック(DOM非依存)」準拠。
// DOM 描画・要素待機・位置追従は src/lib/ui/coachmark.ts (CoachmarkHost 実装) が担う。
//
// 状態は GameState.tutorialV2 (TutorialV2State) を直接 mutate する:
//   - queue:    待機中 coachmark ID (FIFO + priority)
//   - shownIds: 表示完了 (スキップ含む) 済み ID — 再表示防止・セーブ復元の要
//   - pendingId: モーダル退避中の復帰用
//   - enabled/disabled: 有効フラグ / 旧方式ロールバックフラグ

import type { TutorialV2State } from '../types'
import type { CoachmarkDef, CoachmarkReward } from '../config/coachmarks'

/** DOM 層が実装する描画インターフェース */
export interface CoachmarkHost {
    /** tip を表示する (要素待機・位置計算は host 側の責務) */
    showTip(def: CoachmarkDef): void
    /** 表示中の tip を除去する */
    hideTip(id: string): void
    /** 報酬を付与する (money/brandPower) */
    grantReward(reward: CoachmarkReward): void
}

export class CoachmarkManager {
    private activeId: string | null = null
    private modalPaused = false

    constructor(
        private readonly state: TutorialV2State,
        private readonly defs: Record<string, CoachmarkDef>,
        private readonly host: CoachmarkHost
    ) {}

    /** 表示中の coachmark ID (テスト・デバッグ用) */
    get active(): string | null {
        return this.activeId
    }

    /** チュートリアル開始。enabled/disabled ガード込み */
    start(entryId: string): void {
        if (!this.state.enabled || this.state.disabled) return
        this.enqueue(entryId)
    }

    /**
     * coachmark をキューに積む。
     * 未知 ID / 表示済み / キュー重複 / 表示中 / 退避中は無視 (冪等)
     */
    enqueue(id: string): void {
        if (!this.state.enabled || this.state.disabled) return
        if (!this.defs[id]) return
        if (this.state.shownIds.includes(id)) return
        if (this.state.queue.includes(id)) return
        if (this.activeId === id || this.state.pendingId === id) return
        this.state.queue.push(id)
        this.tryNext()
    }

    /**
     * ゲーム内アクション発生の通知。
     * 表示中 coachmark の完了条件と一致したら完了させる。
     * モーダル退避中 (pendingId) も照合する — 「結果モーダル表示 → アクション通知」の
     * 順で呼ばれると active が退避済みで完了を取り逃すため (採用成功/月次決算等)
     */
    notifyAction(action: string): void {
        if (this.activeId !== null && this.defs[this.activeId]?.action === action) {
            this.complete(this.activeId)
            return
        }
        if (this.state.pendingId !== null && this.defs[this.state.pendingId]?.action === action) {
            const id = this.state.pendingId
            this.state.pendingId = null
            this.complete(id)
        }
    }

    /** action なし tip の「次へ」ボタン */
    advance(): void {
        if (this.activeId === null) return
        const def = this.defs[this.activeId]
        if (!def?.action) {
            this.complete(this.activeId)
        }
    }

    /**
     * 表示中 coachmark をスキップ扱いで完了する (報酬なし)。
     * DOM 層の要素待機タイムアウト時にも呼ばれる (詰まり防止のフォールバック)
     */
    skipActive(): void {
        if (this.activeId === null) return
        this.complete(this.activeId, { grantReward: false })
    }

    /** チュートリアル全体を終了する (スキップリンク) */
    skipAll(): void {
        if (this.activeId !== null) {
            this.host.hideTip(this.activeId)
            this.state.shownIds.push(this.activeId)
            this.activeId = null
        }
        this.state.queue = []
        this.state.pendingId = null
        this.state.enabled = false
    }

    /** モーダル表示時: tip を退避 (pendingId に保存) */
    pauseForModal(): void {
        this.modalPaused = true
        if (this.activeId !== null) {
            this.host.hideTip(this.activeId)
            this.state.pendingId = this.activeId
            this.activeId = null
        }
    }

    /** モーダル閉鎖時: 退避中 tip を先頭で復帰 */
    resumeAfterModal(): void {
        this.modalPaused = false
        if (this.state.pendingId !== null) {
            const id = this.state.pendingId
            this.state.pendingId = null
            if (!this.state.shownIds.includes(id) && this.defs[id]) {
                this.state.queue.unshift(id)
            }
        }
        this.tryNext()
    }

    /** セーブ復元後の再開 (queue/pendingId が残っていれば続きから表示) */
    resume(): void {
        if (this.state.pendingId !== null) {
            this.resumeAfterModal()
        } else {
            this.tryNext()
        }
    }

    private complete(id: string, opts: { grantReward: boolean } = { grantReward: true }): void {
        const def = this.defs[id]
        this.host.hideTip(id)
        this.activeId = null
        if (!this.state.shownIds.includes(id)) {
            this.state.shownIds.push(id)
        }
        if (opts.grantReward && def?.reward) {
            this.host.grantReward(def.reward)
        }
        if (def?.next) {
            this.enqueue(def.next)
        }
        this.tryNext()
    }

    /** priority 降順 (同値は FIFO) で次の coachmark を表示する */
    private tryNext(): void {
        if (this.activeId !== null || this.modalPaused) return
        if (!this.state.enabled || this.state.disabled) return
        if (this.state.queue.length === 0) return

        let bestIndex = 0
        let bestPriority = this.defs[this.state.queue[0]]?.priority ?? 0
        for (let i = 1; i < this.state.queue.length; i++) {
            const p = this.defs[this.state.queue[i]]?.priority ?? 0
            if (p > bestPriority) {
                bestIndex = i
                bestPriority = p
            }
        }

        const [nextId] = this.state.queue.splice(bestIndex, 1)
        const def = this.defs[nextId]
        if (!def) {
            this.tryNext()
            return
        }
        this.activeId = nextId
        this.host.showTip(def)
    }
}
