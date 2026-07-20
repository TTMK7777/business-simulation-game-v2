// ビジネスエンパイア 2.0 - Chart.js統合モジュール
// game.ts:741-742, 1530-1565, 1639-1688 から抽出

import { Chart, ensureRegistered, applyChartTheme } from '../charts'
import { getGame, getActivePanel, getCompetitors } from '../store/gameStore'
import type { FinanceSnapshot } from '../types'

// ============================================
// チャートインスタンス（モジュールスコープ）
// ============================================
let revenueChart: any = null
let marketChart: any = null
let financePlChart: any = null
let financeCfChart: any = null
let financeBsChart: any = null

// ============================================
// チャート初期化
// ============================================

export function initCharts(): void {
    ensureRegistered()
    const game = getGame()

    // 売上チャート
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement | null
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: game.revenueHistory.map((_: any, i: number) => `${i + 1}月`),
                datasets: [{
                    label: '売上（万円）',
                    data: game.revenueHistory.map((r: number) => r / 10000),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        })
    }

    // 市場シェアチャート
    const marketCtx = document.getElementById('marketChart')
    if (marketCtx) {
        updateMarketChart()
    }

    // 財務3表チャート
    initFinanceCharts()
}

// ============================================
// チャート更新
// ============================================

export function updateCharts(): void {
    const game = getGame()
    const activePanel = getActivePanel()

    if (revenueChart) {
        revenueChart.data.labels = game.revenueHistory.map((_: any, i: number) => `${i + 1}月`)
        revenueChart.data.datasets[0].data = game.revenueHistory.map((r: number) => r / 10000)
        revenueChart.update()
    }

    if (activePanel === 'market') {
        updateMarketChart()
    }

    if (activePanel === 'finance') {
        updateFinanceCharts()
    }
}

// ============================================
// 市場シェアチャート更新
// ============================================

export function updateMarketChart(): void {
    const game = getGame()
    const competitors = getCompetitors()
    const marketCtx = document.getElementById('marketChart') as HTMLCanvasElement | null
    if (!marketCtx) return

    if (marketChart) {
        marketChart.destroy()
    }

    const allCompanies = [
        ...competitors.map(c => ({ name: c.name, share: c.share })),
        { name: 'あなた', share: game.marketShare }
    ]

    marketChart = new Chart(marketCtx, {
        type: 'doughnut',
        data: {
            labels: allCompanies.map(c => c.name),
            datasets: [{
                data: allCompanies.map(c => c.share),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#ffd700'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    })
}

// ============================================
// 財務3表チャート（P/L構成・CF推移・簡易B/S）
// ============================================

export function initFinanceCharts(): void {
    ensureRegistered()
    updateFinanceCharts()
}

export function updateFinanceCharts(): void {
    const game = getGame()
    const history: FinanceSnapshot[] = game.financeHistory
    updateFinancePlChart(history)
    updateFinanceCfChart(history)
    updateFinanceBsChart(history)
}

// P/L構成: 今月の売上・人件費・利息・純利益を1本ずつの棒で表示
//
// 財務パネルは .panel { display: none } で初期非表示のため、mutate-in-place
// (.data を書き換えて .update() する方式) だと初回作成時の 0×0 サイズが固定化され、
// タブを開いても潰れたまま描画される。marketChart と同じ「毎回 destroy → 再作成」
// パターンを踏襲し、パネルが可視化されたタイミングで正しいサイズを取得させる。
function updateFinancePlChart(history: FinanceSnapshot[]): void {
    const canvas = document.getElementById('financePlChart') as HTMLCanvasElement | null
    if (!canvas) return

    if (financePlChart) {
        financePlChart.destroy()
    }

    const latest = history[history.length - 1]
    const values = latest
        ? [latest.revenue, latest.salaryTotal, latest.interest, latest.profit]
        : [0, 0, 0, 0]
    const profitColor = !latest || latest.profit >= 0 ? '#4caf50' : '#f44336'

    financePlChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['売上', '人件費', '利息', '純利益'],
            datasets: [{
                label: '今月の P/L（万円）',
                data: values.map(v => v / 10000),
                backgroundColor: ['#667eea', '#f093fb', '#ffb74d', profitColor]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    })
}

// CF推移: 営業CF・財務CFの折れ線（destroy → 再作成方式。理由は updateFinancePlChart 参照）
function updateFinanceCfChart(history: FinanceSnapshot[]): void {
    const canvas = document.getElementById('financeCfChart') as HTMLCanvasElement | null
    if (!canvas) return

    if (financeCfChart) {
        financeCfChart.destroy()
    }

    const labels = history.map((_, i) => `${i + 1}月`)
    const operating = history.map(h => h.operatingCF / 10000)
    const financing = history.map(h => h.financingCF / 10000)

    financeCfChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '営業CF（万円）',
                    data: operating,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: '財務CF（万円）',
                    data: financing,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    })
}

// 簡易B/S推移: 現金（プラス）と借入残高（マイナス）の積上げ棒（destroy → 再作成方式。理由は updateFinancePlChart 参照）
function updateFinanceBsChart(history: FinanceSnapshot[]): void {
    const canvas = document.getElementById('financeBsChart') as HTMLCanvasElement | null
    if (!canvas) return

    if (financeBsChart) {
        financeBsChart.destroy()
    }

    const labels = history.map((_, i) => `${i + 1}月`)
    const cash = history.map(h => h.cash / 10000)
    const debt = history.map(h => -h.debt / 10000)

    financeBsChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: '現金（万円）', data: cash, backgroundColor: '#667eea' },
                { label: '借入残高（万円）', data: debt, backgroundColor: '#f44336' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    })
}

export function destroyFinanceCharts(): void {
    if (financePlChart) {
        financePlChart.destroy()
        financePlChart = null
    }
    if (financeCfChart) {
        financeCfChart.destroy()
        financeCfChart = null
    }
    if (financeBsChart) {
        financeBsChart.destroy()
        financeBsChart = null
    }
}

// ============================================
// チャートインスタンスアクセサ
// ============================================

export function getRevenueChart(): any {
    return revenueChart
}

export function getMarketChart(): any {
    return marketChart
}

export function destroyCharts(): void {
    if (revenueChart) {
        revenueChart.destroy()
        revenueChart = null
    }
    if (marketChart) {
        marketChart.destroy()
        marketChart = null
    }
    destroyFinanceCharts()
}

// ============================================
// テーマ追随（デザイントークン + ダークモード）
// ============================================

// テーマ切替時に呼び出す。Chart.defaults の色をCSS変数から再取得したうえで、
// revenueChart（mutate-in-place方式のため destroy→recreate されない）だけ明示的に再描画する。
// financePlChart/financeCfChart/financeBsChart/marketChart は
// 毎回 destroy→再作成されるため、次回のパネル更新時に新しい Chart.defaults を自動的に拾う。
export function refreshChartsForTheme(): void {
    applyChartTheme()
    if (revenueChart) {
        revenueChart.update()
    }
}
