// PPM（BCGマトリクス）2×2 描画（Phase 3 Wave 2-B）
//
// 縦軸＝市場成長率、横軸＝相対シェア。各象限に実データの製品をプロットする。
// 図鑑の理論説明ではなく「今の自分のポートフォリオ」を見せるのが目的なので、
// 象限の定石は1行に留め、数字（成長率・相対シェア）を製品ごとに出す。

import { escapeHtml } from './escape'
import { PPM_QUADRANTS, type PpmView, type PpmQuadrant, type PpmEntry } from '../managers/PpmManager'
import { HIGH_GROWTH_THRESHOLD } from '../config/marketSegments'

/** 表示順: 上段＝高成長（花形・問題児）、下段＝低成長（金のなる木・負け犬） */
const QUADRANT_LAYOUT: PpmQuadrant[] = ['question_mark', 'star', 'dog', 'cash_cow']

function renderEntry(entry: PpmEntry): string {
    return `
        <div class="ppm-item" title="${escapeHtml(entry.segmentName)}">
            <span class="ppm-item-name">${escapeHtml(entry.productName)}</span>
            <span class="ppm-item-stats">
                ${escapeHtml(entry.segmentEmoji)} 成長 ${entry.growthRate.toFixed(1)}% ／ 相対シェア ${entry.relativeShare.toFixed(2)}
            </span>
        </div>
    `
}

function renderCell(quadrant: PpmQuadrant, view: PpmView): string {
    const def = PPM_QUADRANTS[quadrant]
    const entries = view.byQuadrant[quadrant]

    return `
        <div class="ppm-cell ppm-cell-${escapeHtml(quadrant)} ${entries.length > 0 ? 'is-occupied' : ''}">
            <div class="ppm-cell-head">
                ${escapeHtml(def.emoji)} <strong>${escapeHtml(def.name)}</strong>
                <span class="ppm-cell-count">${entries.length}</span>
            </div>
            <div class="ppm-cell-advice">${escapeHtml(def.advice)}</div>
            <div class="ppm-cell-items">
                ${entries.map(renderEntry).join('')}
            </div>
        </div>
    `
}

export function renderPpmMatrix(view: PpmView): string {
    if (!view.hasProducts) {
        return `
            <div class="ppm-section">
                <h4 class="ppm-title">🎯 プロダクト・ポートフォリオ (PPM)</h4>
                <p class="ppm-empty">まだ製品がありません。製品を開発すると、参入した市場の成長率とシェアからここに配置されます。</p>
            </div>
        `
    }

    return `
        <div class="ppm-section">
            <h4 class="ppm-title">🎯 プロダクト・ポートフォリオ (PPM)</h4>
            <p class="ppm-lead">
                縦軸＝市場成長率（${HIGH_GROWTH_THRESHOLD}%以上で高成長）／ 横軸＝相対シェア（最大競合との比。1.00 で並ぶ）
            </p>
            <div class="ppm-matrix">
                <div class="ppm-axis-y"><span>高<br>成<br>長</span><span>低<br>成<br>長</span></div>
                <div class="ppm-grid">
                    ${QUADRANT_LAYOUT.map(q => renderCell(q, view)).join('')}
                </div>
                <div class="ppm-axis-x"><span>← 相対シェア 低</span><span>高 →</span></div>
            </div>
        </div>
    `
}
