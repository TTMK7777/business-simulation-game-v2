/**
 * A2UI Game-Specific Components for Business Empire
 * Rich UI components for game features
 */

import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './components'

// ============================================
// AI Advisor Card Component
// ============================================
@customElement('a2ui-advisor-card')
export class A2UIAdvisorCard extends LitElement {
  @property({ type: String }) advisorName = 'AI経営コンサルタント'
  @property({ type: String }) advisorEmoji = '🤖'
  @property({ type: String }) message = ''
  @property({ type: String }) category: 'finance' | 'hr' | 'market' | 'product' | 'general' = 'general'
  @property({ type: String }) sentiment: 'positive' | 'neutral' | 'warning' | 'critical' = 'neutral'
  @property({ type: Array }) suggestions: string[] = []
  @state() private isExpanded = false

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .advisor-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      position: relative;
      overflow: hidden;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .advisor-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .advisor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .advisor-avatar {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      backdrop-filter: blur(10px);
    }

    .advisor-info {
      flex: 1;
    }

    .advisor-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .advisor-category {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 12px;
    }

    .message-content {
      background: rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      backdrop-filter: blur(10px);
      line-height: 1.6;
    }

    .suggestions-section {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 16px;
    }

    .suggestions-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .suggestion-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-item:hover {
      background: rgba(255,255,255,0.2);
      transform: translateX(4px);
    }

    .suggestion-icon {
      font-size: 16px;
    }

    /* Sentiment indicators */
    .sentiment-positive { border-left: 4px solid #4CAF50; }
    .sentiment-neutral { border-left: 4px solid #2196F3; }
    .sentiment-warning { border-left: 4px solid #FF9800; }
    .sentiment-critical { border-left: 4px solid #F44336; }

    .expand-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .expand-btn:hover {
      background: rgba(255,255,255,0.2);
    }
  `

  private getCategoryInfo() {
    const categories: Record<string, { emoji: string; label: string }> = {
      finance: { emoji: '💰', label: '財務アドバイス' },
      hr: { emoji: '👥', label: '人事アドバイス' },
      market: { emoji: '📊', label: '市場分析' },
      product: { emoji: '📦', label: '製品戦略' },
      general: { emoji: '💡', label: '経営アドバイス' }
    }
    return categories[this.category] || categories.general
  }

  render() {
    const categoryInfo = this.getCategoryInfo()
    const showSuggestions = this.suggestions.length > 0

    return html`
      <div class="advisor-card sentiment-${this.sentiment}">
        <div class="advisor-header">
          <div class="advisor-avatar">${this.advisorEmoji}</div>
          <div class="advisor-info">
            <div class="advisor-name">${this.advisorName}</div>
            <div class="advisor-category">
              <span>${categoryInfo.emoji}</span>
              <span>${categoryInfo.label}</span>
            </div>
          </div>
        </div>

        <div class="message-content">
          ${this.message}
        </div>

        ${showSuggestions ? html`
          <div class="suggestions-section">
            <div class="suggestions-title">
              <span>💡</span>
              <span>おすすめアクション</span>
            </div>
            <div class="suggestion-list">
              ${this.suggestions.map(suggestion => html`
                <div class="suggestion-item">
                  <span class="suggestion-icon">→</span>
                  <span>${suggestion}</span>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}
      </div>
    `
  }
}

// ============================================
// News Card Component
// ============================================
@customElement('a2ui-news-card')
export class A2UINewsCard extends LitElement {
  @property({ type: String }) headline = ''
  @property({ type: String }) content = ''
  @property({ type: String }) category: 'economy' | 'industry' | 'company' | 'tech' | 'policy' = 'industry'
  @property({ type: String }) impact: 'positive' | 'negative' | 'neutral' = 'neutral'
  @property({ type: String }) date = ''

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .news-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .news-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .category-economy { background: #E3F2FD; color: #1565C0; }
    .category-industry { background: #F3E5F5; color: #7B1FA2; }
    .category-company { background: #E8F5E9; color: #2E7D32; }
    .category-tech { background: #FFF3E0; color: #E65100; }
    .category-policy { background: #ECEFF1; color: #455A64; }

    .impact-indicator {
      margin-left: auto;
      font-size: 20px;
    }

    .news-body {
      padding: 0 20px 20px;
    }

    .headline {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .content {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }

    .news-footer {
      padding: 12px 20px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #888;
    }

    .impact-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .impact-positive { color: #4CAF50; }
    .impact-negative { color: #F44336; }
    .impact-neutral { color: #9E9E9E; }
  `

  private getCategoryInfo() {
    const categories: Record<string, { emoji: string; label: string }> = {
      economy: { emoji: '📈', label: '経済' },
      industry: { emoji: '🏭', label: '業界' },
      company: { emoji: '🏢', label: '企業' },
      tech: { emoji: '💻', label: 'テクノロジー' },
      policy: { emoji: '📋', label: '政策' }
    }
    return categories[this.category] || categories.industry
  }

  private getImpactInfo() {
    const impacts: Record<string, { emoji: string; label: string }> = {
      positive: { emoji: '📈', label: 'プラス影響' },
      negative: { emoji: '📉', label: 'マイナス影響' },
      neutral: { emoji: '➖', label: '影響なし' }
    }
    return impacts[this.impact] || impacts.neutral
  }

  render() {
    const categoryInfo = this.getCategoryInfo()
    const impactInfo = this.getImpactInfo()

    return html`
      <div class="news-card">
        <div class="news-header">
          <span class="category-badge category-${this.category}">
            <span>${categoryInfo.emoji}</span>
            <span>${categoryInfo.label}</span>
          </span>
          <span class="impact-indicator">${impactInfo.emoji}</span>
        </div>
        <div class="news-body">
          <div class="headline">${this.headline}</div>
          <div class="content">${this.content}</div>
        </div>
        <div class="news-footer">
          <span>${this.date || '最新ニュース'}</span>
          <span class="impact-label impact-${this.impact}">
            ${impactInfo.label}
          </span>
        </div>
      </div>
    `
  }
}

// ============================================
// Employee Card Component
// ============================================
@customElement('a2ui-employee-card')
export class A2UIEmployeeCard extends LitElement {
  @property({ type: String }) name = ''
  @property({ type: String }) position = ''
  @property({ type: String }) department = ''
  @property({ type: String }) personality = ''
  @property({ type: Number }) motivation = 100
  @property({ type: Object }) skills: Record<string, number> = {}
  @property({ type: Array }) certifications: string[] = []

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .employee-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }

    .employee-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }

    .employee-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: 600;
    }

    .employee-info {
      flex: 1;
    }

    .employee-name {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .employee-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #666;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .motivation-section {
      margin-bottom: 20px;
    }

    .motivation-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .motivation-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .motivation-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .motivation-high { background: linear-gradient(90deg, #4CAF50, #8BC34A); }
    .motivation-medium { background: linear-gradient(90deg, #FF9800, #FFC107); }
    .motivation-low { background: linear-gradient(90deg, #F44336, #FF5722); }

    .skills-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .skill-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .skill-name { color: #666; }
    .skill-value { color: #333; font-weight: 500; }

    .skill-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .skill-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 3px;
    }

    .certifications-section {
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .cert-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #E8F5E9;
      color: #2E7D32;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .personality-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #F3E5F5;
      color: #7B1FA2;
      border-radius: 12px;
      font-size: 11px;
    }
  `

  private getMotivationClass() {
    if (this.motivation >= 70) return 'high'
    if (this.motivation >= 40) return 'medium'
    return 'low'
  }

  private getPersonalityEmoji() {
    const personalities: Record<string, string> = {
      'すなお': '😊',
      'まじめ': '📚',
      'お調子者': '🎉',
      '野心家': '🔥',
      '協調的': '🤝'
    }
    return personalities[this.personality] || '👤'
  }

  render() {
    const initial = this.name ? this.name.charAt(0) : '?'
    const skillEntries = Object.entries(this.skills)

    return html`
      <div class="employee-card">
        <div class="employee-header">
          <div class="avatar">${initial}</div>
          <div class="employee-info">
            <div class="employee-name">${this.name}</div>
            <div class="employee-meta">
              <span class="meta-item">👔 ${this.position}</span>
              <span class="meta-item">🏢 ${this.department}</span>
            </div>
            ${this.personality ? html`
              <span class="personality-badge">
                ${this.getPersonalityEmoji()} ${this.personality}
              </span>
            ` : nothing}
          </div>
        </div>

        <div class="motivation-section">
          <div class="motivation-label">
            <span>💪 モチベーション</span>
            <span>${this.motivation}%</span>
          </div>
          <div class="motivation-bar">
            <div class="motivation-fill motivation-${this.getMotivationClass()}"
                 style="width: ${this.motivation}%;"></div>
          </div>
        </div>

        ${skillEntries.length > 0 ? html`
          <div class="skills-section">
            <div class="section-title">
              <span>📊</span>
              <span>スキル</span>
            </div>
            <div class="skills-grid">
              ${skillEntries.map(([name, value]) => html`
                <div class="skill-item">
                  <div class="skill-header">
                    <span class="skill-name">${name}</span>
                    <span class="skill-value">${value}</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: ${value}%;"></div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}

        ${this.certifications.length > 0 ? html`
          <div class="certifications-section">
            <div class="section-title">
              <span>🎓</span>
              <span>資格</span>
            </div>
            <div class="cert-list">
              ${this.certifications.map(cert => html`
                <span class="cert-badge">✓ ${cert}</span>
              `)}
            </div>
          </div>
        ` : nothing}
      </div>
    `
  }
}

// ============================================
// Event Notification Component
// ============================================
@customElement('a2ui-event-notification')
export class A2UIEventNotification extends LitElement {
  @property({ type: String }) title = ''
  @property({ type: String }) message = ''
  @property({ type: String }) eventType: 'success' | 'warning' | 'danger' | 'info' | 'achievement' = 'info'
  @property({ type: String }) icon = ''
  @property({ type: Boolean }) autoClose = true
  @property({ type: Number }) duration = 5000
  @state() private isVisible = true
  @state() private isClosing = false

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .notification {
      position: relative;
      border-radius: 16px;
      padding: 20px 24px;
      color: white;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      animation: slideDown 0.4s ease-out;
      overflow: hidden;
    }

    .notification.closing {
      animation: slideUp 0.3s ease-in forwards;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }

    .type-success { background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); }
    .type-warning { background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%); }
    .type-danger { background: linear-gradient(135deg, #F44336 0%, #FF5722 100%); }
    .type-info { background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%); }
    .type-achievement {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #333;
    }

    .notification::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%);
      pointer-events: none;
    }

    .icon-container {
      font-size: 32px;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .message {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: rgba(255,255,255,0.4);
      animation: progress linear forwards;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `

  private getDefaultIcon() {
    const icons: Record<string, string> = {
      success: '✅',
      warning: '⚠️',
      danger: '🚨',
      info: '💡',
      achievement: '🏆'
    }
    return icons[this.eventType] || '📢'
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.autoClose) {
      setTimeout(() => this.close(), this.duration)
    }
  }

  private close() {
    this.isClosing = true
    setTimeout(() => {
      this.isVisible = false
      this.dispatchEvent(new CustomEvent('close'))
    }, 300)
  }

  render() {
    if (!this.isVisible) return nothing

    return html`
      <div class="notification type-${this.eventType} ${this.isClosing ? 'closing' : ''}">
        <div class="icon-container">${this.icon || this.getDefaultIcon()}</div>
        <div class="content">
          <div class="title">${this.title}</div>
          <div class="message">${this.message}</div>
        </div>
        <button class="close-btn" @click=${this.close}>×</button>
        ${this.autoClose ? html`
          <div class="progress-bar" style="animation-duration: ${this.duration}ms;"></div>
        ` : nothing}
      </div>
    `
  }
}

// ============================================
// Financial Dashboard Component
// ============================================
@customElement('a2ui-finance-dashboard')
export class A2UIFinanceDashboard extends LitElement {
  @property({ type: Number }) revenue = 0
  @property({ type: Number }) expenses = 0
  @property({ type: Number }) profit = 0
  @property({ type: Number }) cash = 0
  @property({ type: Number }) debt = 0
  @property({ type: Array }) history: { month: string; revenue: number; profit: number }[] = []

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .dashboard {
      display: grid;
      gap: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .metric-icon {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .metric-change {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
    }

    .change-positive { background: #E8F5E9; color: #2E7D32; }
    .change-negative { background: #FFEBEE; color: #C62828; }

    .profit-positive { color: #4CAF50; }
    .profit-negative { color: #F44336; }

    .summary-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
    }

    .summary-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .summary-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .summary-label {
      opacity: 0.9;
    }

    .summary-value {
      font-weight: 600;
    }
  `

  private formatMoney(value: number): string {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}億円`
    }
    if (value >= 10000) {
      return `${Math.floor(value / 10000)}万円`
    }
    return `${value.toLocaleString()}円`
  }

  render() {
    const profitClass = this.profit >= 0 ? 'profit-positive' : 'profit-negative'

    return html`
      <div class="dashboard">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-label">手持ち資金</div>
            <div class="metric-value">${this.formatMoney(this.cash)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-label">売上高</div>
            <div class="metric-value">${this.formatMoney(this.revenue)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-label">営業利益</div>
            <div class="metric-value ${profitClass}">${this.formatMoney(this.profit)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">🏦</div>
            <div class="metric-label">借入金</div>
            <div class="metric-value">${this.formatMoney(this.debt)}</div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-title">
            <span>📋</span>
            <span>損益サマリー</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">売上高</span>
            <span class="summary-value">+${this.formatMoney(this.revenue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">経費</span>
            <span class="summary-value">-${this.formatMoney(this.expenses)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">営業利益</span>
            <span class="summary-value">${this.profit >= 0 ? '+' : ''}${this.formatMoney(this.profit)}</span>
          </div>
        </div>
      </div>
    `
  }
}

// Export all game components
export const A2UIGameComponents = {
  A2UIAdvisorCard,
  A2UINewsCard,
  A2UIEmployeeCard,
  A2UIEventNotification,
  A2UIFinanceDashboard
}
