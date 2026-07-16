/**
 * GameManager.ts の一部ロジックに対するユニットテスト
 *
 * テスト対象 (DOM 非依存の純ロジック): determineAnimationState
 * GameManager.ts 自体は window.* 経由の DOM/UI 呼び出しが大半を占めるオーケストレーターのため、
 * それらは実ブラウザ E2E で検証する方針 (coachmark.test.ts / theory.test.ts と同じ方針)。
 * このテストは GameManager.ts を直接 import できる (＝依存グラフに DOM 副作用が無い) ことの
 * 確認も兼ねる。
 */

import { describe, it, expect } from 'vitest'
import { determineAnimationState } from '../lib/managers/GameManager'

describe('determineAnimationState', () => {
    it('稼働していなければ常に idle', () => {
        expect(determineAnimationState(false, 0, 100)).toBe('idle')
        expect(determineAnimationState(false, 90, 0)).toBe('idle')
    })

    it('稼働中でストレスが70超なら stressed (モチベーションより優先)', () => {
        expect(determineAnimationState(true, 71, 100)).toBe('stressed')
    })

    it('稼働中でストレスは70以下だがモチベーションが30未満なら idle', () => {
        expect(determineAnimationState(true, 0, 29)).toBe('idle')
    })

    it('稼働中でストレス・モチベーション共に正常なら working', () => {
        expect(determineAnimationState(true, 50, 50)).toBe('working')
    })

    it('境界値: ストレスちょうど70は stressed にならない', () => {
        expect(determineAnimationState(true, 70, 50)).toBe('working')
    })

    it('境界値: モチベーションちょうど30は idle にならない', () => {
        expect(determineAnimationState(true, 0, 30)).toBe('working')
    })
})
