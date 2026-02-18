// ビジネスエンパイア 2.0 - Chart.js統合モジュール
// game.ts:741-742, 1530-1565, 1639-1688 から抽出

import { Chart } from '../charts'
import { getGame, getActivePanel, getCompetitors } from '../store/gameStore'

// ============================================
// チャートインスタンス（モジュールスコープ）
// ============================================
let revenueChart: any = null
let marketChart: any = null

// ============================================
// チャート初期化
// ============================================

export function initCharts(): void {
    const game = getGame()

    // 売上チャート
    const revenueCtx = document.getElementById('revenueChart')
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
}

// ============================================
// 市場シェアチャート更新
// ============================================

export function updateMarketChart(): void {
    const game = getGame()
    const competitors = getCompetitors()
    const marketCtx = document.getElementById('marketChart')
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
}
