// デザイントークン + ダークモード: テーマ管理モジュール
// 純関数（DOM非依存、ユニットテスト対象）と DOM副作用（ブラウザ環境専用）を分離する。

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme'

// ============================================
// 純関数
// ============================================

/**
 * 保存済みテーマ値とシステム設定（prefers-color-scheme）から初期テーマを決定する。
 * stored が 'light'/'dark' の場合はユーザーの明示選択を優先し、
 * それ以外（null・不正値）なら prefersDark に従う。
 */
export function resolveInitialTheme(stored: string | null, prefersDark: boolean): ThemeMode {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}

/** 現在のテーマの反対を返す（トグル用） */
export function nextTheme(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark'
}

/** stored が明示的なユーザー選択（'light'/'dark'）かどうか */
export function isExplicitTheme(stored: string | null): stored is ThemeMode {
  return stored === 'light' || stored === 'dark'
}

// ============================================
// DOM副作用（ブラウザ環境専用。initTheme() 呼び出し後に有効）
// ============================================

let currentTheme: ThemeMode = 'light'
const listeners = new Set<(mode: ThemeMode) => void>()

function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // プライベートブラウジング等 localStorage 無効環境
    return null
  }
}

function persistTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // 永続化できない場合は諦める（テーマ切替自体は継続）
  }
}

export function getCurrentTheme(): ThemeMode {
  return currentTheme
}

/**
 * テーマを適用する。documentElement に data-theme を設定し、
 * 購読者（Chart.js 再描画フック等）に通知する。
 * @param persist false の場合 localStorage に保存しない（system追従の初期適用時に使用）
 */
export function applyTheme(mode: ThemeMode, persist = true): void {
  currentTheme = mode
  document.documentElement.dataset.theme = mode
  if (persist) persistTheme(mode)
  listeners.forEach((cb) => cb(mode))
}

export function toggleTheme(): ThemeMode {
  const next = nextTheme(currentTheme)
  applyTheme(next)
  return next
}

/** テーマ変更を購読する。戻り値の関数を呼ぶと購読解除される。 */
export function onThemeChange(cb: (mode: ThemeMode) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

let themeInitialized = false

/**
 * 起動時に一度だけ呼ぶ。保存値 or システム設定からテーマを決定して適用し、
 * ユーザーが明示選択していない間は prefers-color-scheme の変更にも追従する。
 * 冪等: 2回目以降の呼び出しは no-op（matchMedia リスナーの多重登録を防ぐ。
 * 社外取締役レビュー指摘 2026-07-16）
 */
export function initTheme(): void {
  if (themeInitialized) return
  themeInitialized = true
  const stored = readStoredTheme()
  const prefersDark =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false

  applyTheme(resolveInitialTheme(stored, prefersDark), false)

  if (!isExplicitTheme(stored) && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', (e) => {
      // その後ユーザーが明示選択していたら system 追従をやめる
      if (isExplicitTheme(readStoredTheme())) return
      applyTheme(e.matches ? 'dark' : 'light', false)
    })
  }
}
