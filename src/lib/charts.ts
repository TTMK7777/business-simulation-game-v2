// Chart.js 初期化とエクスポート
// ビジネスエンパイア 2.0 - Chart.js統合

import {
  Chart,
  LineController,
  DoughnutController,
  RadarController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// 遅延登録フラグ
let registered = false

/**
 * Chart.js コンポーネントを遅延登録する。
 * 初回呼び出し時のみ Chart.register() を実行し、
 * モジュールインポート時のグローバルスコープ実行を回避する。
 */
export function ensureRegistered(): void {
  if (registered) return
  Chart.register(
    LineController,
    DoughnutController,
    RadarController,
    BarController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
  )
  registered = true
}

/**
 * Chart.js の目盛・凡例・グリッド線の色をデザイントークン（CSS変数）から反映する。
 * データセットの系列色（backgroundColor/borderColor）は個別指定を維持するため触らない。
 * テーマ切替時に呼び出す想定（charts.integration.ts の refreshChartsForTheme 経由）。
 */
export function applyChartTheme(): void {
  if (typeof document === 'undefined') return
  const styles = getComputedStyle(document.documentElement)
  const textColor = styles.getPropertyValue('--color-text-secondary').trim()
  const gridColor = styles.getPropertyValue('--color-border').trim()
  if (textColor) Chart.defaults.color = textColor
  if (gridColor) Chart.defaults.borderColor = gridColor
}

// Chartをエクスポート
export { Chart }

// デフォルトエクスポート（後方互換性のため）
export default Chart
