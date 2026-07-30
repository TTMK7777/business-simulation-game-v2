// ビジネスエンパイア 2.0 - シナリオ管理（Wave 3-D）
//
// specs/002-phase2-core-loop.md D の実装。
// 「クリア条件のないサンドボックス」に起承転結を与えるため、期限内の生存を勝利条件にする。
// 破産判定は既存の FinanceManager / game.isBankrupt をそのまま流用し、
// ここでは「決着したか」の判定と事後講評の組み立てだけを行う（DOM 非依存）。

import { getGame } from '../store/gameStore'
import { getScenario, type ScenarioDef } from '../config/scenarios'
import { THEORIES } from '../config/theories'
import type { GameState, ScenarioResult, ScenarioDebrief } from '../types'

// ============================================
// 経過月数
// ============================================

/** シナリオ開始からの経過月数（年またぎ対応） */
export function getSurvivedMonths(state: GameState): number {
    const startYear = state.scenarioStartYear ?? state.year
    const startMonth = state.scenarioStartMonth ?? state.month
    return (state.year - startYear) * 12 + (state.month - startMonth)
}

// ============================================
// 決着判定
// ============================================

/**
 * シナリオの決着を判定する。決着していなければ null。
 *
 * 破産をクリアより先に見る: 最終月に資金が尽きたら負け（生き延びていない）。
 * 決着済み（scenarioResult 設定済み）は再判定しない＝結果画面の二重表示を防ぐ。
 */
export function checkScenarioOutcome(state: GameState): ScenarioResult | null {
    const scenario = getScenario(state.scenarioId)
    if (!scenario) return null
    if (state.scenarioResult) return null

    if (state.isBankrupt || state.money < 0) return 'gameover'
    if (getSurvivedMonths(state) >= scenario.survivalMonths) return 'clear'

    return null
}

// ============================================
// 開始
// ============================================

/**
 * シナリオを開始する（開始資金の上書きと起点の記録）。
 * 難易度の startingMoney より後に呼ぶこと。未知の id なら状態を変えず null。
 */
export function startScenario(scenarioId: string): ScenarioDef | null {
    const scenario = getScenario(scenarioId)
    if (!scenario) return null

    const game = getGame()
    game.scenarioId = scenario.id
    game.money = scenario.startingMoney
    game.scenarioStartYear = game.year
    game.scenarioStartMonth = game.month
    game.scenarioResult = null

    return scenario
}

// ============================================
// 事後講評（バックログ「経営を理論で振り返る」の v1）
// ============================================

function buildComment(state: GameState, result: ScenarioResult, survivedMonths: number): string {
    if (result === 'gameover') {
        return `${survivedMonths}ヶ月目に資金が尽きました。売上が固定費（人件費＋オフィス維持費）を上回る前に現金が持たなかったのが直接の敗因です。製品を早く出すか、規模を抑えて損益分岐点を下げるかの二択でした。`
    }

    const hasProfit = state.monthlyRevenue > 0
    if (!hasProfit) {
        return `12ヶ月を生き延びました。ただし売上が立たないまま資金を持たせた形なので、次は「稼ぐ仕組み」を作るところまで踏み込めます。`
    }
    if (state.marketShare >= 5) {
        return `12ヶ月を生き延び、シェアも取りました。製品への投資が売上として返り、固定費を吸収できたのが勝因です。`
    }
    return `12ヶ月を生き延びました。売上は立ちましたが市場での存在感はこれからです。次はシェアやブランドへの投資を狙えます。`
}

/**
 * 結果画面に出す講評データを組み立てる。シナリオ未選択なら null。
 */
export function buildDebrief(state: GameState, result: ScenarioResult): ScenarioDebrief | null {
    const scenario = getScenario(state.scenarioId)
    if (!scenario) return null

    const survivedMonths = getSurvivedMonths(state)

    const metrics = [
        { label: '💰 最終資金', value: `${Math.floor(state.money / 10000).toLocaleString()}万円` },
        { label: '📊 直近の月商', value: `${Math.floor(state.monthlyRevenue / 10000).toLocaleString()}万円` },
        { label: '🏦 借入残高', value: `${Math.floor(state.debt / 10000).toLocaleString()}万円` },
        { label: '📈 市場シェア', value: `${state.marketShare.toFixed(1)}%` },
        { label: '⭐ ブランド力', value: `${Math.floor(state.brandPower)}` },
        { label: '👥 従業員', value: `${state.employees.length}名` },
        { label: '📦 製品', value: `${state.products.length}本` }
    ]

    // 体験した経営理論（存在しない id は無視する＝旧セーブ耐性）
    const theories = (state.unlockedTheories || [])
        .map(id => THEORIES[id])
        .filter(Boolean)
        .map(def => ({ emoji: def.emoji, name: def.name, summary: def.summary }))

    return {
        result,
        scenarioName: scenario.name,
        survivedMonths,
        requiredMonths: scenario.survivalMonths,
        metrics,
        theories,
        comment: buildComment(state, result, survivedMonths)
    }
}
