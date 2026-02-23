// Chart.js 初期化とエクスポート
// ビジネスエンパイア 2.0 - Chart.js統合

import {
  Chart,
  LineController,
  DoughnutController,
  RadarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
  )
  registered = true
}

// Chartをエクスポート
export { Chart }

// デフォルトエクスポート（後方互換性のため）
export default Chart
