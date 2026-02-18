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

// 必要なコンポーネントを登録
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

// Chartをエクスポート
export { Chart }

// デフォルトエクスポート（後方互換性のため）
export default Chart
