// 経営理論図鑑 - UI 層 (DOM 描画)
// 純ロジックは managers/TheoryManager.ts に分離。
// showModal は renderers.ts と同じく window bridge 経由で呼ぶ (循環 import 回避)。
// 解禁通知は「プレイの手を止めない」toast — モーダル連打を避けるのが設計意図
// (行動→命名の学習体験。plan.md 経営理論学習レイヤー Phase A)。

import { html as litHtml, render as litRender } from 'lit'
import { THEORY_CATEGORIES, type TheoryDef } from '../config/theories'
import { getTheoriesList, getTheoryProgress } from '../managers/TheoryManager'

// ============================================
// 概要パネルのミニ図鑑 (実績パネルと同型)
// ============================================

export function renderTheories(): void {
    const display = document.getElementById('theoryDisplay')
    if (!display) return

    const progress = getTheoryProgress()
    const theories = getTheoriesList()
    const recentUnlocked = theories.filter(t => t.unlocked).slice(-5).reverse()

    const template = litHtml`
        <div class="achievement-header">
            <h4 style="margin: 0; font-size: 14px;">📖 経営理論図鑑</h4>
            <span class="achievement-progress">${progress.unlocked}/${progress.total}</span>
        </div>
        <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width: ${progress.percentage}%"></div>
        </div>
        <div class="achievement-list">
            ${recentUnlocked.length > 0 ? recentUnlocked.map(theory => litHtml`
                <div class="achievement-badge theory-badge" title="${theory.name}: ${theory.tagline}"
                     @click=${() => showTheoryDetail(theory.id)}>
                    <span class="achievement-emoji">${theory.emoji}</span>
                </div>
            `) : litHtml`
                <div style="color: #999; font-size: 12px; text-align: center; width: 100%;">
                    経営を進めると、あなたの行動に対応する理論が解禁されます
                </div>
            `}
        </div>
        <button class="btn-small" @click=${showAllTheories} style="margin-top: 8px; width: 100%;">
            図鑑を開く
        </button>
    `

    litRender(template, display)
}

// ============================================
// 図鑑一覧モーダル
// ============================================

export function showAllTheories(): void {
    const theories = getTheoriesList()
    const progress = getTheoryProgress()

    const rows = theories.map(theory => {
        const category = THEORY_CATEGORIES[theory.category]
        if (theory.unlocked) {
            return `
                <div class="theory-row" onclick="showTheoryDetail('${theory.id}')">
                    <span class="theory-row-emoji">${theory.emoji}</span>
                    <div class="theory-row-body">
                        <div class="theory-row-name">${theory.name}
                            <span class="theory-row-category">${category.emoji} ${category.name}</span>
                        </div>
                        <div class="theory-row-tagline">${theory.tagline}</div>
                    </div>
                    <span class="theory-row-arrow">›</span>
                </div>`
        }
        return `
            <div class="theory-row theory-row-locked">
                <span class="theory-row-emoji">❓</span>
                <div class="theory-row-body">
                    <div class="theory-row-name">？？？</div>
                    <div class="theory-row-tagline">${theory.hintText}</div>
                </div>
            </div>`
    }).join('')

    const html = `
        <div style="margin-bottom: 12px; text-align: center;">
            <div style="font-size: 13px; color: #666;">
                プレイ中の行動に対応する経営理論が解禁されていきます<br>
                解禁済み: <strong>${progress.unlocked}</strong> / ${progress.total}
            </div>
            <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-top: 8px;">
                <div style="width: ${progress.percentage}%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;"></div>
            </div>
        </div>
        <div class="theory-list-modal">${rows}</div>
    `
    ;(window as any).showModal?.('📖 経営理論図鑑', html, true)
}

// ============================================
// 理論詳細モーダル
// ============================================

export function showTheoryDetail(theoryId: string): void {
    const theory = getTheoriesList().find(t => t.id === theoryId)
    if (!theory || !theory.unlocked) return

    const category = THEORY_CATEGORIES[theory.category]
    const html = `
        <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 48px; margin-bottom: 8px;">${theory.emoji}</div>
            <div style="font-size: 18px; font-weight: bold;">${theory.name}</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">${category.emoji} ${category.name}</div>
            <div style="font-size: 14px; color: #667eea; margin-top: 8px; font-weight: bold;">${theory.tagline}</div>
        </div>
        <div class="theory-detail-section">
            <div class="theory-detail-label">💡 どういう理論？</div>
            <div class="theory-detail-text">${theory.summary}</div>
        </div>
        <div class="theory-detail-section">
            <div class="theory-detail-label">🏢 実例</div>
            <div class="theory-detail-text">${theory.example}</div>
        </div>
        <div class="theory-detail-section theory-detail-gamehint">
            <div class="theory-detail-label">🎮 このゲームでは</div>
            <div class="theory-detail-text">${theory.gameHint}</div>
        </div>
        <button class="btn-small" onclick="showAllTheories()" style="margin-top: 12px; width: 100%;">
            図鑑一覧へ戻る
        </button>
    `
    ;(window as any).showModal?.(`📖 経営理論`, html, true)
}

// ============================================
// 解禁 toast (プレイの手を止めない通知)
// ============================================

const TOAST_DURATION_MS = 8000

export function showTheoryUnlocked(theory: TheoryDef): void {
    // 同一理論の toast 多重表示を防ぐ (checkTheories 側で重複解禁は起きないが防御)
    const existing = document.querySelector(`.theory-toast[data-theory-id="${theory.id}"]`)
    if (existing) return

    const toast = document.createElement('div')
    toast.className = 'theory-toast'
    toast.dataset.theoryId = theory.id
    toast.setAttribute('role', 'status')

    const template = litHtml`
        <span class="theory-toast-emoji">${theory.emoji}</span>
        <div class="theory-toast-body">
            <div class="theory-toast-title">📖 経営理論を発見: ${theory.name}</div>
            <div class="theory-toast-message">${theory.unlockMessage}</div>
            <div class="theory-toast-cta">タップで解説を見る</div>
        </div>
    `
    litRender(template, toast)

    toast.addEventListener('click', () => {
        removeToast(toast)
        showTheoryDetail(theory.id)
    })

    document.body.appendChild(toast)
    // 出現アニメーション (CSS transition 発火のため 1 フレーム待つ)
    requestAnimationFrame(() => toast.classList.add('theory-toast-visible'))

    setTimeout(() => removeToast(toast), TOAST_DURATION_MS)
}

function removeToast(toast: HTMLElement): void {
    if (!toast.isConnected) return
    toast.classList.remove('theory-toast-visible')
    setTimeout(() => toast.remove(), 300)
}
