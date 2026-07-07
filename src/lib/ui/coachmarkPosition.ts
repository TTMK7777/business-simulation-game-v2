// Sprint E: Coachmark 位置計算 (純関数・DOM 非依存)
// 取締役会 推奨条件「位置計算を独立ユーティリティ化」対応。
// jsdom なしの node 環境でテスト可能にするため Rect/Viewport は plain object。

export interface CmRect {
    top: number
    left: number
    width: number
    height: number
}

export interface CmSize {
    width: number
    height: number
}

export interface CmViewport {
    width: number
    height: number
}

export type CmPlacement = 'top' | 'bottom'

export interface CmPosition {
    left: number
    top: number
    placement: CmPlacement
    /** 矢印の左位置 (tip 左端からの px)。ターゲット中心を指す */
    arrowLeft: number
}

/**
 * ターゲット矩形に対する tip の表示位置を計算する。
 * - 縦: 原則ターゲットの下。収まらなければ上に反転。両方収まらなければ下配置のまま viewport 内へ clamp
 * - 横: ターゲット中心に tip 中心を合わせ、viewport 内に clamp
 * - 矢印: clamp 後もターゲット中心を指し続ける (tip 内相対座標で返す)
 */
export function calculatePosition(
    target: CmRect,
    tip: CmSize,
    viewport: CmViewport,
    margin = 8
): CmPosition {
    const targetCenterX = target.left + target.width / 2
    const targetBottom = target.top + target.height

    // 縦配置の決定
    const fitsBelow = targetBottom + margin + tip.height <= viewport.height
    const fitsAbove = target.top - margin - tip.height >= 0
    const placement: CmPlacement = fitsBelow || !fitsAbove ? 'bottom' : 'top'

    let top = placement === 'bottom'
        ? targetBottom + margin
        : target.top - margin - tip.height
    // 両方向とも収まらない小画面では viewport 内に clamp
    top = Math.min(Math.max(top, margin), Math.max(viewport.height - tip.height - margin, margin))

    // 横: 中心合わせ → clamp
    let left = targetCenterX - tip.width / 2
    left = Math.min(Math.max(left, margin), Math.max(viewport.width - tip.width - margin, margin))

    // 矢印はターゲット中心を指す (tip 内側 12px マージンで clamp)
    const arrowLeft = Math.min(Math.max(targetCenterX - left, 12), tip.width - 12)

    return { left, top, placement, arrowLeft }
}
