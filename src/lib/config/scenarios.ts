// ビジネスエンパイア 2.0 - シナリオ定義（Wave 3-D）
//
// specs/002-phase2-core-loop.md D の実装。
// サンドボックス（クリア条件なし）に起承転結を与えるため、
// 「期限内の生存」を勝利条件にした短尺シナリオを用意する。
// 破産判定・難易度機構は既存のものをそのまま流用する。

export interface ScenarioDef {
    id: string
    emoji: string
    name: string
    /** 選択画面の1行説明 */
    description: string
    /** ゲーム内の目標提示文 */
    goalText: string
    /** 開始資金（円）。難易度の startingMoney を上書きする */
    startingMoney: number
    /** クリアに必要な生存月数 */
    survivalMonths: number
}

export const SCENARIOS: Record<string, ScenarioDef> = {
    startup_year_one: {
        id: 'startup_year_one',
        emoji: '🌱',
        name: '起業1年目',
        description: '資金を絞った12ヶ月生存チャレンジ',
        goalText: '資金をショートさせずに12ヶ月生き延びる。製品を作り、売上を固定費より大きくするのが勝ち筋です。',
        // 開発コスト200万 + 数ヶ月の固定費を賄える最低限。
        // 実測でのクリア率に応じて調整する値（scripts/balance-scenario.mjs）
        startingMoney: 6_000_000,
        survivalMonths: 12
    }
}

export function getScenario(id: string | null | undefined): ScenarioDef | null {
    if (!id) return null
    return SCENARIOS[id] ?? null
}
