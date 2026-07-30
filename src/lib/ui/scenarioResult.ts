// シナリオ結果画面 + 事後講評（Wave 3-D）
//
// バックログ「あなたの経営を理論で振り返る」の v1。
// 主要指標サマリ + このプレイで体験した経営理論の一覧を出す。

import { escapeHtml } from './escape'
import type { ScenarioDebrief } from '../types'

export function renderScenarioResult(debrief: ScenarioDebrief): string {
    const isClear = debrief.result === 'clear'

    const metricsHtml = debrief.metrics.map(m => `
        <div class="scenario-metric">
            <span class="scenario-metric-label">${escapeHtml(m.label)}</span>
            <span class="scenario-metric-value">${escapeHtml(m.value)}</span>
        </div>
    `).join('')

    const theoriesHtml = debrief.theories.length > 0
        ? `
            <div class="scenario-theories">
                <h4 class="scenario-section-title">📖 このプレイで体験した経営理論（${debrief.theories.length}件）</h4>
                ${debrief.theories.map(t => `
                    <div class="scenario-theory">
                        <div class="scenario-theory-name">${escapeHtml(t.emoji)} ${escapeHtml(t.name)}</div>
                        <div class="scenario-theory-summary">${escapeHtml(t.summary)}</div>
                    </div>
                `).join('')}
            </div>
        `
        : `
            <div class="scenario-theories">
                <h4 class="scenario-section-title">📖 このプレイで体験した経営理論</h4>
                <p class="scenario-theories-empty">今回は理論の解禁がありませんでした。決裁や経営判断を重ねると図鑑が埋まっていきます。</p>
            </div>
        `

    return `
        <div class="scenario-result">
            <div class="scenario-result-head ${isClear ? 'is-clear' : 'is-gameover'}">
                <div class="scenario-result-emoji">${isClear ? '🎉' : '😔'}</div>
                <div class="scenario-result-title">${isClear ? 'クリア！' : 'ゲームオーバー'}</div>
                <div class="scenario-result-sub">
                    ${escapeHtml(debrief.scenarioName)} — ${debrief.survivedMonths}ヶ月 / ${debrief.requiredMonths}ヶ月
                </div>
            </div>

            <h4 class="scenario-section-title">📊 経営の結果</h4>
            <div class="scenario-metrics">
                ${metricsHtml}
            </div>

            <div class="scenario-comment">${escapeHtml(debrief.comment)}</div>

            ${theoriesHtml}
        </div>
    `
}
