// 週次ミニイベント モーダル（Wave 2-A / 2-C）
//
// 設計制約（specs/002 A）: 全選択肢に「数字への影響」を併記する。
// 影響文字列は WeeklyEventManager.buildImpactLabel が作った値をそのまま表示するため、
// 表示と適用がずれない。

import { escapeHtml } from './escape'
import type { WeeklyEventState } from '../types'
import type { WeeklyEventResolution } from '../managers/WeeklyEventManager'

const KIND_LABEL: Record<WeeklyEventState['kind'], string> = {
    decision: '決裁',
    hr: '人事',
    market: '市場'
}

export function renderWeeklyEvent(event: WeeklyEventState): string {
    const optionsHtml = event.options.map(opt => `
        <button class="btn weekly-event-option" onclick="resolveWeeklyEventAction('${escapeHtml(opt.id)}')">
            <span class="weekly-event-option-label">${escapeHtml(opt.label)}</span>
            <span class="weekly-event-option-impact">${escapeHtml(opt.impact)}</span>
        </button>
    `).join('')

    return `
        <div class="weekly-event">
            <div class="weekly-event-badge">${escapeHtml(KIND_LABEL[event.kind])}</div>
            <h3 class="weekly-event-title">${escapeHtml(event.emoji)} ${escapeHtml(event.title)}</h3>
            <p class="weekly-event-desc">${escapeHtml(event.description).replace(/\n/g, '<br>')}</p>
            <div class="weekly-event-options">
                ${optionsHtml}
            </div>
        </div>
    `
}

export function renderWeeklyEventResult(resolution: WeeklyEventResolution): string {
    const impactsHtml = resolution.impacts.length > 0
        ? `<ul class="weekly-event-impacts">${resolution.impacts.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
        : '<p class="weekly-event-impacts-empty">数字は動きませんでした。</p>'

    // 経営理論タグ (v2.3.0 資産)。決裁カードのときのみ付き、管理モードでも発火する
    const tag = resolution.theoryTag
    const theoryHtml = tag ? `
        <div class="verdict-theory-tag" onclick="showTheoryDetail('${escapeHtml(tag.theoryId)}')">
            <div class="verdict-theory-head">
                💡 今の判断は… ${escapeHtml(tag.emoji)} <strong>${escapeHtml(tag.theoryName)}</strong>
                ${tag.newlyUnlocked ? '<span class="verdict-theory-new">📖 図鑑に追加！</span>' : ''}
            </div>
            <div class="verdict-theory-lesson">${escapeHtml(tag.lesson)}</div>
            <div class="verdict-theory-cta">タップで解説を見る</div>
        </div>
    ` : ''

    return `
        <div class="weekly-event-result">
            <p class="weekly-event-result-desc">${escapeHtml(resolution.description)}</p>
            ${impactsHtml}
            ${theoryHtml}
        </div>
    `
}
