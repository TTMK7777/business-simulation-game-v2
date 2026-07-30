/**
 * ScenarioManager.ts のユニットテスト（Wave 3-D: シナリオ「起業1年目」）
 *
 * テスト対象:
 * - getSurvivedMonths(): シナリオ開始からの経過月数（年またぎ含む）
 * - checkScenarioOutcome(): 12ヶ月生存でクリア / 資金ショートでゲームオーバー / 決着済みは再判定しない
 * - startScenario(): 開始資金の上書きと起点の記録
 * - buildDebrief(): 主要指標サマリ + 体験した理論一覧（事後講評 v1）
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSurvivedMonths,
  checkScenarioOutcome,
  startScenario,
  buildDebrief,
} from '../lib/managers/ScenarioManager'
import { getGame, resetGameState } from '../lib/store/gameStore'
import { SCENARIOS } from '../lib/config/scenarios'

beforeEach(() => {
  resetGameState()
})

const SCENARIO = SCENARIOS.startup_year_one

function setupScenarioGame(overrides: Record<string, any> = {}) {
  const game = getGame()
  game.gameMode = 'management'
  game.scenarioId = SCENARIO.id
  game.scenarioStartYear = 2025
  game.scenarioStartMonth = 1
  game.scenarioResult = null
  game.year = 2025
  game.month = 1
  game.week = 1
  game.money = SCENARIO.startingMoney
  game.isBankrupt = false
  Object.assign(game, overrides)
  return game
}

// ============================================================
// 経過月数
// ============================================================
describe('getSurvivedMonths', () => {
  it('開始月は0ヶ月', () => {
    const game = setupScenarioGame()
    expect(getSurvivedMonths(game)).toBe(0)
  })

  it('同じ年の中で正しく数える', () => {
    const game = setupScenarioGame({ month: 5 })
    expect(getSurvivedMonths(game)).toBe(4)
  })

  it('年をまたいでも正しく数える', () => {
    const game = setupScenarioGame({ year: 2026, month: 1 })
    expect(getSurvivedMonths(game)).toBe(12)
  })

  it('開始が1月以外でも起点からの差分になる', () => {
    const game = setupScenarioGame({ scenarioStartMonth: 7, year: 2026, month: 3 })
    expect(getSurvivedMonths(game)).toBe(8)
  })
})

// ============================================================
// 決着判定
// ============================================================
describe('checkScenarioOutcome', () => {
  it('シナリオ未選択（サンドボックス）は常に null', () => {
    const game = setupScenarioGame({ scenarioId: null, isBankrupt: true })
    expect(checkScenarioOutcome(game)).toBeNull()
  })

  it('生存月数が足りず健全なら決着しない', () => {
    const game = setupScenarioGame({ month: 6 })
    expect(checkScenarioOutcome(game)).toBeNull()
  })

  it('必要月数に到達したらクリア', () => {
    const game = setupScenarioGame({ year: 2026, month: 1 })
    expect(checkScenarioOutcome(game)).toBe('clear')
  })

  it('資金ショート（破産）ならゲームオーバー', () => {
    const game = setupScenarioGame({ month: 4, isBankrupt: true })
    expect(checkScenarioOutcome(game)).toBe('gameover')
  })

  it('資金がマイナスなら破産フラグ前でもゲームオーバー', () => {
    const game = setupScenarioGame({ month: 4, money: -1 })
    expect(checkScenarioOutcome(game)).toBe('gameover')
  })

  it('破産はクリア判定より優先される（最終月に落ちたら負け）', () => {
    const game = setupScenarioGame({ year: 2026, month: 1, isBankrupt: true })
    expect(checkScenarioOutcome(game)).toBe('gameover')
  })

  it('決着済みなら再判定しない（結果画面の二重表示を防ぐ）', () => {
    const game = setupScenarioGame({ year: 2026, month: 1, scenarioResult: 'clear' })
    expect(checkScenarioOutcome(game)).toBeNull()
  })
})

// ============================================================
// 開始
// ============================================================
describe('startScenario', () => {
  it('開始資金を上書きし、起点の年月を記録する', () => {
    const game = getGame()
    game.year = 2025
    game.month = 1
    game.money = 99_999_999

    const def = startScenario(SCENARIO.id)!

    expect(def.id).toBe(SCENARIO.id)
    expect(game.scenarioId).toBe(SCENARIO.id)
    expect(game.money).toBe(SCENARIO.startingMoney)
    expect(game.scenarioStartYear).toBe(2025)
    expect(game.scenarioStartMonth).toBe(1)
    expect(game.scenarioResult).toBeNull()
  })

  it('未知のシナリオ id は null（状態も変えない）', () => {
    const game = getGame()
    const before = game.money
    expect(startScenario('no_such_scenario')).toBeNull()
    expect(game.scenarioId).toBeNull()
    expect(game.money).toBe(before)
  })
})

// ============================================================
// 事後講評
// ============================================================
describe('buildDebrief', () => {
  it('クリア時は生存月数と主要指標が入る', () => {
    const game = setupScenarioGame({
      year: 2026, month: 1, money: 12_340_000,
      marketShare: 7.5, brandPower: 12, monthlyRevenue: 2_000_000,
    })

    const debrief = buildDebrief(game, 'clear')!

    expect(debrief.result).toBe('clear')
    expect(debrief.scenarioName).toBe(SCENARIO.name)
    expect(debrief.survivedMonths).toBe(12)
    expect(debrief.requiredMonths).toBe(SCENARIO.survivalMonths)
    expect(debrief.metrics.length).toBeGreaterThan(0)
    // 主要指標に資金が含まれる
    expect(debrief.metrics.some(m => m.label.includes('資金'))).toBe(true)
  })

  it('体験した理論が一覧化される（解禁済みのみ）', () => {
    const game = setupScenarioGame({ unlockedTheories: ['sunk_cost'] })

    const debrief = buildDebrief(game, 'gameover')!

    expect(debrief.theories.length).toBe(1)
    expect(debrief.theories[0].name.length).toBeGreaterThan(0)
  })

  it('理論を1つも解禁していなければ空配列（講評自体は出る）', () => {
    const game = setupScenarioGame({ unlockedTheories: [] })

    const debrief = buildDebrief(game, 'gameover')!

    expect(debrief.theories).toEqual([])
    expect(debrief.comment.length).toBeGreaterThan(0)
  })

  it('存在しない理論 id は無視される（旧セーブ耐性）', () => {
    const game = setupScenarioGame({ unlockedTheories: ['sunk_cost', 'no_such_theory'] })

    const debrief = buildDebrief(game, 'clear')!

    expect(debrief.theories.length).toBe(1)
  })

  it('シナリオ未選択なら講評を作らない', () => {
    const game = setupScenarioGame({ scenarioId: null })
    expect(buildDebrief(game, 'clear')).toBeNull()
  })

  it('ゲームオーバー時の講評は敗因に触れる', () => {
    const game = setupScenarioGame({ month: 5, money: -500_000, isBankrupt: true })

    const debrief = buildDebrief(game, 'gameover')!

    expect(debrief.result).toBe('gameover')
    expect(debrief.survivedMonths).toBe(4)
    expect(debrief.comment).toContain('資金')
  })
})
