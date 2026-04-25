/**
 * gameStore.ts のユニットテスト（Sprint C 回帰テスト）
 *
 * テスト対象:
 * - I-1: _pendingCausalEffects の正規化（normalizeGameState で配列保証）
 * - I-3: wasLowMoney の型バリデーション（normalizeGameState で boolean 保証）
 * - I-6: tutorialCompleted / tutorialStep の型バリデーション
 *   - 旧セーブからのロードで欠損フィールドが正しくデフォルト復元されること
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGame,
  overwriteGameState,
  cloneDefaults,
  normalizeGameState,
  resetGameState,
} from '../lib/store/gameStore'

beforeEach(() => {
  resetGameState()
})

describe('I-6: tutorialCompleted / tutorialStep バリデーション', () => {
  it('旧セーブで tutorialCompleted フィールドが欠損していたら false に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.tutorialCompleted
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(false)
  })

  it('tutorialCompleted が boolean 以外（文字列）でも false に強制される', () => {
    const corrupted: any = { ...cloneDefaults(), tutorialCompleted: 'yes' }
    overwriteGameState(corrupted)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(false)
  })

  it('tutorialCompleted=true のセーブはそのまま保持される', () => {
    const completedSave: any = { ...cloneDefaults(), tutorialCompleted: true }
    overwriteGameState(completedSave)

    normalizeGameState()

    expect(getGame().tutorialCompleted).toBe(true)
  })

  it('tutorialStep が負値や非数値なら 0 に正規化される', () => {
    const corrupted: any = { ...cloneDefaults(), tutorialStep: -5 }
    overwriteGameState(corrupted)
    normalizeGameState()
    expect(getGame().tutorialStep).toBe(0)

    const corrupted2: any = { ...cloneDefaults(), tutorialStep: 'invalid' }
    overwriteGameState(corrupted2)
    normalizeGameState()
    expect(getGame().tutorialStep).toBe(0)
  })
})

describe('I-3: wasLowMoney 型バリデーション', () => {
  it('旧セーブで wasLowMoney フィールドが欠損していたら false に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.wasLowMoney
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().wasLowMoney).toBe(false)
  })

  it('wasLowMoney=true のセーブはそのまま保持される（comeback 実績判定継続）', () => {
    const recoveringSave: any = { ...cloneDefaults(), wasLowMoney: true }
    overwriteGameState(recoveringSave)

    normalizeGameState()

    expect(getGame().wasLowMoney).toBe(true)
  })
})

describe('I-1: _pendingCausalEffects 配列保証', () => {
  it('旧セーブで _pendingCausalEffects が欠損していたら空配列に正規化される', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave._pendingCausalEffects
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(Array.isArray(getGame()._pendingCausalEffects)).toBe(true)
    expect(getGame()._pendingCausalEffects.length).toBe(0)
  })

  it('_pendingCausalEffects が非配列（オブジェクト）の場合も空配列に正規化される', () => {
    const corrupted: any = { ...cloneDefaults(), _pendingCausalEffects: { malicious: true } }
    overwriteGameState(corrupted)

    normalizeGameState()

    expect(Array.isArray(getGame()._pendingCausalEffects)).toBe(true)
    expect(getGame()._pendingCausalEffects.length).toBe(0)
  })
})

describe('CEO mode フィールドの正規化', () => {
  it('gameMode が未定義なら management にフォールバック', () => {
    const oldSave: any = cloneDefaults()
    delete oldSave.gameMode
    overwriteGameState(oldSave)

    normalizeGameState()

    expect(getGame().gameMode).toBe('management')
  })

  it('gameMode=ceo は保持される（CEOセーブのロード経路）', () => {
    const ceoSave: any = { ...cloneDefaults(), gameMode: 'ceo' }
    overwriteGameState(ceoSave)

    normalizeGameState()

    expect(getGame().gameMode).toBe('ceo')
  })
})
