// ビジネスエンパイア 2.0 - 週次ミニイベント定義（Wave 2-A）
//
// specs/002-phase2-core-loop.md A の「人事イベント」「市場・ニュース選択イベント」のプール。
// 決裁カード（種別 'decision'）は DocumentManager が動的生成するためここには持たない。
//
// 設計制約（共通核）: 全選択肢は「数字への影響」を impact に明示する。
// 選んだ結果がどの指標をいくら動かすかが分からない選択肢は追加しないこと。

import type { GameState } from '../types'

/** 選択肢が動かす指標。UI の impact 表示と resolve の適用が同じ定義を読む（表示と実装の乖離防止） */
export interface WeeklyEventEffect {
    money?: number
    brandPower?: number
    marketShare?: number
    /** 対象従業員（hr イベントは対象1名、それ以外は全員）の motivation 増減 */
    motivation?: number
    /** 対象従業員の stress 増減 */
    stress?: number
}

export interface WeeklyEventOptionDef {
    id: string
    label: string
    effect: WeeklyEventEffect
    /** 選択後に表示する一文 */
    resultText: string
}

export interface WeeklyEventDef {
    id: string
    kind: 'hr' | 'market'
    emoji: string
    title: string
    /** {name} は対象従業員名に置換される（hr のみ） */
    description: string
    options: WeeklyEventOptionDef[]
    /** 出現条件。満たさないイベントは抽選対象から外れる */
    isAvailable?: (state: GameState) => boolean
}

/** 人事イベント: モチベーションが落ちた従業員が対象。B の予兆・面談にあたる */
export const HR_WEEKLY_EVENTS: WeeklyEventDef[] = [
    {
        id: 'hr_one_on_one',
        kind: 'hr',
        emoji: '🗣️',
        title: '面談の申し出',
        description: '{name}から「少し話したいことがある」と相談がありました。時間を取りますか？',
        options: [
            {
                id: 'talk',
                label: 'じっくり面談する',
                effect: { motivation: 12, stress: -15 },
                resultText: '本人の不安を聞き取れました。表情が明るくなっています。'
            },
            {
                id: 'later',
                label: '今は忙しい と伝える',
                effect: { motivation: -6 },
                resultText: '「わかりました」とだけ返ってきました。距離ができたようです。'
            }
        ]
    },
    {
        id: 'hr_workload_complaint',
        kind: 'hr',
        emoji: '😵',
        title: '業務量の相談',
        description: '{name}が業務量の多さを訴えています。外注で負荷を逃がすこともできます。',
        options: [
            {
                id: 'outsource',
                label: '外注して負荷を下げる（-30万円）',
                effect: { money: -300_000, stress: -25, motivation: 6 },
                resultText: '外注で手が空きました。負荷が目に見えて下がっています。'
            },
            {
                id: 'endure',
                label: '今期は耐えてもらう',
                effect: { motivation: -8, stress: 10 },
                resultText: '「わかりました」と返ってきましたが、疲労が濃くなっています。'
            }
        ]
    },
    {
        id: 'hr_raise_request',
        kind: 'hr',
        emoji: '💴',
        title: '待遇の相談',
        description: '{name}が待遇について相談してきました。一時金で応えることもできます。',
        options: [
            {
                id: 'bonus',
                label: '一時金を出す（-50万円）',
                effect: { money: -500_000, motivation: 18 },
                resultText: '納得してもらえました。当面は腰を据えてくれそうです。'
            },
            {
                id: 'explain',
                label: '会社の状況を説明して待ってもらう',
                effect: { motivation: -5 },
                resultText: '理解は示してくれましたが、期待に応えられてはいません。'
            }
        ]
    }
]

/** 市場・ニュース選択イベント: 既存の月次ニュースを「選べる」形に拡張したもの */
export const MARKET_WEEKLY_EVENTS: WeeklyEventDef[] = [
    {
        id: 'market_ad_slot',
        kind: 'market',
        emoji: '📣',
        title: '広告枠の空き',
        description: '業界メディアに広告枠の空きが出ました。今なら通常より安く出稿できます。',
        options: [
            {
                id: 'buy',
                label: '出稿する（-80万円）',
                effect: { money: -800_000, brandPower: 4, marketShare: 0.8 },
                resultText: '露出が増え、認知が広がりました。'
            },
            {
                id: 'skip',
                label: '見送る',
                effect: {},
                resultText: '今回は資金を温存しました。'
            }
        ]
    },
    {
        id: 'market_conference',
        kind: 'market',
        emoji: '🎤',
        title: '業界カンファレンス登壇の打診',
        description: '業界カンファレンスから登壇の打診がありました。準備には社内の工数がかかります。',
        options: [
            {
                id: 'speak',
                label: '登壇する（準備で負荷増）',
                effect: { brandPower: 6, stress: 12, motivation: 4 },
                resultText: '登壇は好評でした。会社の名前が業界に届いています。'
            },
            {
                id: 'decline',
                label: '断る',
                effect: {},
                resultText: '目の前の開発に集中することにしました。'
            }
        ]
    },
    {
        id: 'market_price_war',
        kind: 'market',
        emoji: '⚔️',
        title: '競合の値下げ攻勢',
        description: '競合が値下げを仕掛けてきました。追随すればシェアを守れますが利益を削ります。',
        options: [
            {
                id: 'follow',
                label: '追随して値下げする（-60万円）',
                effect: { money: -600_000, marketShare: 1.2 },
                resultText: '価格で踏みとどまり、顧客の流出を抑えました。'
            },
            {
                id: 'hold_price',
                label: '価格を維持する',
                effect: { marketShare: -0.8, brandPower: 2 },
                resultText: 'シェアは削られましたが、安売りしない姿勢は評価されました。'
            }
        ],
        // 製品がないと値下げ競争が成立しない
        isAvailable: (state) => state.products.length > 0
    },
    {
        id: 'market_supplier_deal',
        kind: 'market',
        emoji: '🤝',
        title: '取引先からの前払い提案',
        description: '取引先から「前払いするので単価を下げてほしい」と提案がありました。',
        options: [
            {
                id: 'accept',
                label: '受ける（+100万円 / ブランド微減）',
                effect: { money: 1_000_000, brandPower: -3 },
                resultText: '当座の資金は厚くなりましたが、安く見られる余地も残りました。'
            },
            {
                id: 'refuse',
                label: '断る',
                effect: { brandPower: 1 },
                resultText: '値決めの主導権を守りました。'
            }
        ]
    }
]

export const ALL_WEEKLY_EVENTS: WeeklyEventDef[] = [...HR_WEEKLY_EVENTS, ...MARKET_WEEKLY_EVENTS]
