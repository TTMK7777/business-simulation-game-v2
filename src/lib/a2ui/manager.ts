/**
 * A2UI Manager for Business Empire
 * Manages dynamic UI generation and updates
 */

import { html, render } from 'lit'

// Types for A2UI Manager
export interface AdvisorMessage {
  category: 'finance' | 'hr' | 'market' | 'product' | 'general'
  sentiment: 'positive' | 'neutral' | 'warning' | 'critical'
  message: string
  suggestions?: string[]
}

export interface NewsItem {
  headline: string
  content: string
  category: 'economy' | 'industry' | 'company' | 'tech' | 'policy'
  impact: 'positive' | 'negative' | 'neutral'
  date?: string
}

export interface EmployeeData {
  name: string
  position: string
  department: string
  personality?: string
  motivation: number
  skills: Record<string, number>
  certifications?: string[]
}

export interface EventNotificationData {
  title: string
  message: string
  eventType: 'success' | 'warning' | 'danger' | 'info' | 'achievement'
  icon?: string
  autoClose?: boolean
  duration?: number
}

export interface FinanceData {
  revenue: number
  expenses: number
  profit: number
  cash: number
  debt: number
}

/**
 * A2UI Manager - Singleton class for managing A2UI components
 */
export class A2UIManager {
  private static instance: A2UIManager
  private notificationContainer: HTMLElement | null = null

  // 月次イベント系カード (ニュース/アドバイザー/財務サマリー) の自動消滅タイマー競合防止用
  // (再発火で内容が上書きされた後に古いタイマーが新しい内容を消してしまうのを防ぐ)
  private newsGeneration = 0
  private advisorGeneration = 0
  private financeSummaryGeneration = 0

  private constructor() {
    // DOM Ready後に初期化（安全性向上）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initContainers())
    } else {
      this.initContainers()
    }
  }

  static getInstance(): A2UIManager {
    if (!A2UIManager.instance) {
      A2UIManager.instance = new A2UIManager()
    }
    return A2UIManager.instance
  }

  /**
   * Initialize UI containers
   */
  private initContainers() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('a2ui-notifications')) {
      const container = document.createElement('div')
      container.id = 'a2ui-notifications'
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        pointer-events: none;
      `
      document.body.appendChild(container)
      this.notificationContainer = container
    }
  }

  /**
   * Show AI Advisor message
   */
  showAdvisor(data: AdvisorMessage, containerId?: string): void {
    const container = containerId
      ? document.getElementById(containerId)
      : this.getOrCreateAdvisorContainer()

    if (!container) return

    const template = html`
      <a2ui-advisor-card
        category=${data.category}
        sentiment=${data.sentiment}
        message=${data.message}
        .suggestions=${data.suggestions || []}
      ></a2ui-advisor-card>
    `

    render(template, container)
  }

  /**
   * Show news card
   */
  showNews(news: NewsItem, containerId?: string): void {
    const container = containerId
      ? document.getElementById(containerId)
      : this.getOrCreateNewsContainer()

    if (!container) return

    const template = html`
      <a2ui-news-card
        headline=${news.headline}
        content=${news.content}
        category=${news.category}
        impact=${news.impact}
        date=${news.date || ''}
      ></a2ui-news-card>
    `

    render(template, container)
  }

  /**
   * Show multiple news items
   */
  showNewsFeed(newsItems: NewsItem[], containerId: string): void {
    const container = document.getElementById(containerId)
    if (!container) return

    const template = html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${newsItems.map(news => html`
          <a2ui-news-card
            headline=${news.headline}
            content=${news.content}
            category=${news.category}
            impact=${news.impact}
            date=${news.date || ''}
          ></a2ui-news-card>
        `)}
      </div>
    `

    render(template, container)
  }

  /**
   * Show employee card
   */
  showEmployee(employee: EmployeeData, containerId: string): void {
    const container = document.getElementById(containerId)
    if (!container) return

    const template = html`
      <a2ui-employee-card
        name=${employee.name}
        position=${employee.position}
        department=${employee.department}
        personality=${employee.personality || ''}
        motivation=${employee.motivation}
        .skills=${employee.skills}
        .certifications=${employee.certifications || []}
      ></a2ui-employee-card>
    `

    render(template, container)
  }

  /**
   * Show employee list
   */
  showEmployeeList(employees: EmployeeData[], containerId: string): void {
    const container = document.getElementById(containerId)
    if (!container) return

    const template = html`
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        ${employees.map(emp => html`
          <a2ui-employee-card
            name=${emp.name}
            position=${emp.position}
            department=${emp.department}
            personality=${emp.personality || ''}
            motivation=${emp.motivation}
            .skills=${emp.skills}
            .certifications=${emp.certifications || []}
          ></a2ui-employee-card>
        `)}
      </div>
    `

    render(template, container)
  }

  /**
   * Show event notification (toast)
   */
  showNotification(data: EventNotificationData): void {
    this.initContainers()

    const wrapper = document.createElement('div')
    wrapper.style.pointerEvents = 'auto'

    const template = html`
      <a2ui-event-notification
        title=${data.title}
        message=${data.message}
        eventType=${data.eventType}
        icon=${data.icon || ''}
        ?autoClose=${data.autoClose !== false}
        duration=${data.duration || 5000}
        @close=${() => wrapper.remove()}
      ></a2ui-event-notification>
    `

    render(template, wrapper)
    this.notificationContainer?.appendChild(wrapper)
  }

  /**
   * Show finance dashboard
   */
  showFinanceDashboard(data: FinanceData, containerId: string): void {
    const container = document.getElementById(containerId)
    if (!container) return

    const template = html`
      <a2ui-finance-dashboard
        revenue=${data.revenue}
        expenses=${data.expenses}
        profit=${data.profit}
        cash=${data.cash}
        debt=${data.debt}
      ></a2ui-finance-dashboard>
    `

    render(template, container)
  }

  /**
   * Convenience methods for common notifications
   */
  notifySuccess(title: string, message: string): void {
    this.showNotification({ title, message, eventType: 'success' })
  }

  notifyWarning(title: string, message: string): void {
    this.showNotification({ title, message, eventType: 'warning' })
  }

  notifyDanger(title: string, message: string): void {
    this.showNotification({ title, message, eventType: 'danger' })
  }

  notifyInfo(title: string, message: string): void {
    this.showNotification({ title, message, eventType: 'info' })
  }

  notifyAchievement(title: string, message: string): void {
    this.showNotification({
      title,
      message,
      eventType: 'achievement',
      duration: 8000
    })
  }

  /**
   * Generate AI advisor message based on game state
   */
  generateAdvisorMessage(gameState: {
    money: number
    employees: number
    marketShare: number
    revenue: number
    expenses: number
    month: number
  }): AdvisorMessage {
    const profit = gameState.revenue - gameState.expenses
    const profitMargin = gameState.revenue > 0
      ? (profit / gameState.revenue * 100)
      : 0

    // Financial advice
    if (gameState.money < 1000000) {
      return {
        category: 'finance',
        sentiment: 'critical',
        message: '資金が危険水準です！早急に対策が必要です。',
        suggestions: [
          '銀行融資を検討する',
          '不採算製品を整理する',
          'コスト削減を実施する'
        ]
      }
    }

    // HR advice
    if (gameState.employees < 3) {
      return {
        category: 'hr',
        sentiment: 'warning',
        message: '従業員が少なすぎます。成長のためには人材の確保が重要です。',
        suggestions: [
          '採用活動を開始する',
          '魅力的な給与体系を検討する',
          '採用予算を増やす'
        ]
      }
    }

    // Market advice
    if (gameState.marketShare < 5) {
      return {
        category: 'market',
        sentiment: 'neutral',
        message: '市場シェアの拡大が必要です。マーケティング戦略を見直しましょう。',
        suggestions: [
          'マーケティング活動を強化する',
          '新製品を開発する',
          'ブランド力を高める'
        ]
      }
    }

    // Product advice
    if (profitMargin < 10 && gameState.revenue > 0) {
      return {
        category: 'product',
        sentiment: 'warning',
        message: `利益率が${profitMargin.toFixed(1)}%と低めです。製品戦略の見直しを検討してください。`,
        suggestions: [
          '高付加価値製品を開発する',
          '生産コストを見直す',
          '価格戦略を再検討する'
        ]
      }
    }

    // General positive advice
    if (profit > 0 && gameState.marketShare > 10) {
      return {
        category: 'general',
        sentiment: 'positive',
        message: '経営状態は良好です！この調子で事業を拡大していきましょう。',
        suggestions: [
          '新規市場への参入を検討する',
          '優秀な人材を積極的に採用する',
          '研究開発に投資する'
        ]
      }
    }

    // Default advice
    return {
      category: 'general',
      sentiment: 'neutral',
      message: '現状を維持しつつ、成長の機会を探りましょう。',
      suggestions: [
        '市場動向を注視する',
        '従業員のスキルアップを図る',
        '新製品のアイデアを検討する'
      ]
    }
  }

  /**
   * Helper to get or create advisor container
   */
  private getOrCreateAdvisorContainer(): HTMLElement {
    let container = document.getElementById('a2ui-advisor')
    if (!container) {
      container = document.createElement('div')
      container.id = 'a2ui-advisor'
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 9999;
        max-width: 400px;
      `
      document.body.appendChild(container)
    }
    return container
  }

  /**
   * Helper to get or create news container
   */
  private getOrCreateNewsContainer(): HTMLElement {
    let container = document.getElementById('a2ui-news')
    if (!container) {
      container = document.createElement('div')
      container.id = 'a2ui-news'
      container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 9998;
        max-width: 360px;
      `
      document.body.appendChild(container)
    }
    return container
  }

  /**
   * Helper to get or create finance summary container
   * (turn-fab ボタン (bottom:18px/right:16px) と被らないよう上に確保)
   */
  private getOrCreateFinanceSummaryContainer(): HTMLElement {
    let container = document.getElementById('a2ui-finance-summary')
    if (!container) {
      container = document.createElement('div')
      container.id = 'a2ui-finance-summary'
      container.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 16px;
        z-index: 9998;
        max-width: 340px;
      `
      document.body.appendChild(container)
    }
    return container
  }

  /**
   * 月次ニュースカード (市況/競合イベント) を表示し、一定時間後に自動で消す
   */
  showMonthlyNews(news: NewsItem, durationMs = 12000): void {
    this.showNews(news)
    const container = this.getOrCreateNewsContainer()
    const myGeneration = ++this.newsGeneration
    setTimeout(() => {
      if (this.newsGeneration === myGeneration) {
        render(html``, container)
      }
    }, durationMs)
  }

  /**
   * 資金危険水域アドバイザーカードを表示し、一定時間後に自動で消す
   * (呼び出し元で「新規突入時のみ」の判定を行う想定)
   */
  showDangerAdvisor(data: AdvisorMessage, durationMs = 16000): void {
    this.showAdvisor(data)
    const container = this.getOrCreateAdvisorContainer()
    const myGeneration = ++this.advisorGeneration
    setTimeout(() => {
      if (this.advisorGeneration === myGeneration) {
        render(html``, container)
      }
    }, durationMs)
  }

  /**
   * トースト表示用の簡略金額フォーマット (億/万円単位。a2ui-finance-dashboard の
   * formatMoney と同じ考え方だがコンポーネント private のため個別実装)
   */
  private formatMoneyCompact(value: number): string {
    if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(1)}億円`
    return `${Math.floor(value / 10000)}万円`
  }

  /**
   * 月次決算サマリーカードを表示し、一定時間後に自動で消す
   *
   * a2ui-finance-dashboard (4メトリックカード+損益サマリーで縦800px超) はこのトースト用途には
   * 過大なため使わず、2×2ミニグリッド+1行サマリーの軽量表示に留める (総高さ150px程度)
   */
  // showModal('📅 月次決算') と同時発火するため、モーダルを閉じてから読める猶予を長めに取る
  showFinanceSummary(data: FinanceData, durationMs = 20000): void {
    const container = this.getOrCreateFinanceSummaryContainer()
    const myGeneration = ++this.financeSummaryGeneration

    const profitColor = data.profit >= 0 ? '#4CAF50' : '#F44336'
    const rowStyle = 'display:flex; justify-content:space-between; gap: 8px;'

    const template = html`
      <div style="background: rgba(255,255,255,0.97); border-radius: 16px; padding: 14px 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;">
        <div style="font-size: 13px; font-weight: 600; color: #667eea; margin-bottom: 10px;">📊 今月の決算</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: 12px; color: #333;">
          <div style=${rowStyle}><span>💰 資金</span><strong>${this.formatMoneyCompact(data.cash)}</strong></div>
          <div style=${rowStyle}><span>📈 売上</span><strong>${this.formatMoneyCompact(data.revenue)}</strong></div>
          <div style=${rowStyle}><span>📊 利益</span><strong style="color:${profitColor}">${this.formatMoneyCompact(data.profit)}</strong></div>
          <div style=${rowStyle}><span>🏦 借入</span><strong>${this.formatMoneyCompact(data.debt)}</strong></div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #666;">
          売上${this.formatMoneyCompact(data.revenue)} − 経費${this.formatMoneyCompact(data.expenses)} =
          <strong style="color:${profitColor}">${this.formatMoneyCompact(data.profit)}</strong>
        </div>
      </div>
    `
    render(template, container)

    setTimeout(() => {
      if (this.financeSummaryGeneration === myGeneration) {
        render(html``, container)
      }
    }, durationMs)
  }

  /**
   * Clear all A2UI elements
   */
  clearAll(): void {
    // notificationContainer は各トースト用 wrapper を直接 appendChild したもの (lit render 対象は
    // wrapper 側) のため replaceChildren で安全。advisor/news/finance-summary はコンテナ自体に
    // lit render() しているため、replaceChildren で子要素だけ消すと内部の part 参照が不整合になる
    // (次回 render() 時に古い part を参照してしまう) ので、空テンプレートの render() で消す
    this.notificationContainer?.replaceChildren()
    const advisorContainer = document.getElementById('a2ui-advisor')
    if (advisorContainer) render(html``, advisorContainer)
    const newsContainer = document.getElementById('a2ui-news')
    if (newsContainer) render(html``, newsContainer)
    const financeContainer = document.getElementById('a2ui-finance-summary')
    if (financeContainer) render(html``, financeContainer)
    this.newsGeneration++
    this.advisorGeneration++
    this.financeSummaryGeneration++
  }
}

// Export singleton getter
export const getA2UIManager = () => A2UIManager.getInstance()
