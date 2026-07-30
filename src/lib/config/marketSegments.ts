// ビジネスエンパイア 2.0 - 市場セグメント定義（Phase 3 Wave 1-A）
//
// specs/003-market-segments-ppm.md A の実装。
// 単一市場モデルでは PPM の縦軸（市場成長率）が製品ごとに存在しないため、
// 市場を4セグメントに分割し、それぞれ規模・成長率・競合圧を持たせる。
//
// 成長率は固定ではなく時間で変動させる（新興は高成長 → 成熟で鈍化）。
// 固定値だと「最初に高成長セグメントを選ぶだけ」の一択ゲームになり、
// PPM の本質である「入れ替え判断」が発生しないため。

export interface MarketSegmentDef {
    id: string
    emoji: string
    name: string
    /** 選択画面・PPM の説明用 */
    description: string
    /** 市場規模係数（製品売上の倍率。1.0 が標準） */
    sizeFactor: number
    /** 開始時点の月次成長率（%） */
    initialGrowthRate: number
    /**
     * 成熟までの月数。この月数をかけて成長率が maturedGrowthRate へ線形に鈍化する。
     * 新興セグメントほど短期間で高成長 → 急速に成熟する。
     */
    maturityMonths: number
    /** 成熟後の月次成長率（%） */
    maturedGrowthRate: number
    /** 競合の初期シェア合計の目安（%）。高いほど食い込みにくい */
    competitorShare: number
}

/** 成長率がこの値以上なら PPM の縦軸で「高成長」とみなす（%） */
export const HIGH_GROWTH_THRESHOLD = 3.0

export const MARKET_SEGMENTS: Record<string, MarketSegmentDef> = {
    enterprise: {
        id: 'enterprise',
        emoji: '🏛️',
        name: 'エンタープライズ',
        description: '市場は最大。ただし成長は緩やかで競合も強い。',
        sizeFactor: 1.4,
        initialGrowthRate: 1.5,
        maturityMonths: 24,
        maturedGrowthRate: 0.8,
        competitorShare: 70
    },
    smb: {
        id: 'smb',
        emoji: '🏪',
        name: '中小企業向けSaaS',
        description: '規模・成長・競合すべて中庸の定番市場。',
        sizeFactor: 1.0,
        initialGrowthRate: 3.5,
        maturityMonths: 18,
        maturedGrowthRate: 1.5,
        competitorShare: 55
    },
    consumer: {
        id: 'consumer',
        emoji: '📱',
        name: 'コンシューマアプリ',
        description: '伸びは速いが単価が低く、流行り廃りも速い。',
        sizeFactor: 0.8,
        initialGrowthRate: 6.0,
        maturityMonths: 12,
        maturedGrowthRate: 0.5,
        competitorShare: 40
    },
    ai: {
        id: 'ai',
        emoji: '🤖',
        name: 'AI・データ活用',
        description: '競合が薄い高成長市場。ただし成熟も速い。',
        sizeFactor: 1.1,
        initialGrowthRate: 9.0,
        maturityMonths: 15,
        maturedGrowthRate: 1.0,
        competitorShare: 25
    }
}

export const SEGMENT_IDS = Object.keys(MARKET_SEGMENTS)

/** 製品が属さない場合の既定セグメント（旧セーブの製品はここに寄せる） */
export const DEFAULT_SEGMENT_ID = 'smb'

export function getSegment(id: string | null | undefined): MarketSegmentDef | null {
    if (!id) return null
    return MARKET_SEGMENTS[id] ?? null
}

/**
 * 経過月数に応じた現在の月次成長率（%）を返す。
 * 0ヶ月で initialGrowthRate、maturityMonths 以降は maturedGrowthRate。
 */
export function getCurrentGrowthRate(segment: MarketSegmentDef, elapsedMonths: number): number {
    if (elapsedMonths <= 0) return segment.initialGrowthRate
    if (elapsedMonths >= segment.maturityMonths) return segment.maturedGrowthRate

    const ratio = elapsedMonths / segment.maturityMonths
    return segment.initialGrowthRate + (segment.maturedGrowthRate - segment.initialGrowthRate) * ratio
}
