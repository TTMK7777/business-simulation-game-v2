/**
 * theme.ts のユニットテスト（Phase 1 見える化スプリント E: デザイントークン + ダークモード）
 *
 * テスト対象:
 * - resolveInitialTheme: 保存値(light/dark/null/不正値) × prefersDark(true/false) の組み合わせ
 * - nextTheme: light/dark の反転
 * - isExplicitTheme: 型ガードとしての判定
 *
 * Note: applyTheme/initTheme/toggleTheme/onThemeChange は document/localStorage/matchMedia
 *       に依存する DOM副作用のため、jsdom 環境を持たない本プロジェクトの Vitest 設定では対象外
 *       （実ブラウザ確認は Lead が統合後に実施）。
 */
import { describe, it, expect } from 'vitest'
import { resolveInitialTheme, nextTheme, isExplicitTheme } from '../lib/theme'

describe('resolveInitialTheme', () => {
  it('保存値が light なら prefersDark に関わらず light を返す', () => {
    expect(resolveInitialTheme('light', true)).toBe('light')
    expect(resolveInitialTheme('light', false)).toBe('light')
  })

  it('保存値が dark なら prefersDark に関わらず dark を返す', () => {
    expect(resolveInitialTheme('dark', true)).toBe('dark')
    expect(resolveInitialTheme('dark', false)).toBe('dark')
  })

  it('保存値が null なら prefersDark に従う', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
    expect(resolveInitialTheme(null, false)).toBe('light')
  })

  it('保存値が不正な文字列なら prefersDark に従う（壊れた localStorage 値のフォールバック）', () => {
    expect(resolveInitialTheme('系', true)).toBe('dark')
    expect(resolveInitialTheme('', false)).toBe('light')
  })
})

describe('nextTheme', () => {
  it('dark の反対は light', () => {
    expect(nextTheme('dark')).toBe('light')
  })

  it('light の反対は dark', () => {
    expect(nextTheme('light')).toBe('dark')
  })
})

describe('isExplicitTheme', () => {
  it('light/dark は明示的なテーマとみなす', () => {
    expect(isExplicitTheme('light')).toBe(true)
    expect(isExplicitTheme('dark')).toBe(true)
  })

  it('null・不正値は明示的なテーマとみなさない', () => {
    expect(isExplicitTheme(null)).toBe(false)
    expect(isExplicitTheme('system')).toBe(false)
    expect(isExplicitTheme('')).toBe(false)
  })
})
