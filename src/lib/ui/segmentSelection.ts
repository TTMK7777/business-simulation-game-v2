// 参入市場（セグメント）選択モーダル（Phase 3 Wave 1-A）
//
// 製品開発時に「どの市場で戦うか」を選ばせる。
// 週次ミニイベントと同じ方針で、各選択肢に判断材料となる数字を明示する
// （市場規模・現在の成長率・自社シェア・競合の厚み）。

import { escapeHtml } from './escape'
import { MARKET_SEGMENTS, SEGMENT_IDS } from '../config/marketSegments'
import { getSegmentGrowthRate, getSegmentShare, getCompetitorSegmentShare } from '../managers/SegmentManager'
import type { GameState } from '../types'

export function renderSegmentSelection(state: GameState): string {
    const options = SEGMENT_IDS.map(id => {
        const segment = MARKET_SEGMENTS[id]
        const growth = getSegmentGrowthRate(state, id)
        const ourShare = getSegmentShare(state, id)
        const competitor = getCompetitorSegmentShare(state, id)
        const productCount = state.products.filter(p => (p.segmentId || 'smb') === id).length

        return `
            <button class="btn segment-option" onclick="developProduct('${escapeHtml(id)}')">
                <span class="segment-option-head">
                    ${escapeHtml(segment.emoji)} <strong>${escapeHtml(segment.name)}</strong>
                    ${productCount > 0 ? `<span class="segment-option-owned">既に${productCount}本</span>` : ''}
                </span>
                <span class="segment-option-desc">${escapeHtml(segment.description)}</span>
                <span class="segment-option-stats">
                    成長率 ${growth.toFixed(1)}%/月 ／ 自社シェア ${ourShare.toFixed(1)}% ／ 競合 ${competitor.toFixed(0)}% ／ 規模 ×${segment.sizeFactor}
                </span>
            </button>
        `
    }).join('')

    return `
        <div class="segment-selection">
            <p class="segment-selection-lead">
                どの市場に製品を出しますか？ 成長率の高い市場は速くシェアを取れますが、成熟も速く進みます。
            </p>
            <div class="segment-options">
                ${options}
            </div>
        </div>
    `
}
