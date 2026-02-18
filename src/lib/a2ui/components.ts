/**
 * A2UI Components for Business Empire
 * Lit-based UI components inspired by Google's A2UI specification
 */

import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

// ============================================
// Theme Colors (CSS Custom Properties)
// ============================================
export const A2UI_THEME = {
  primary: '#667eea',
  primaryDark: '#764ba2',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
} as const

// ============================================
// Base Styles
// ============================================
const baseStyles = css`
  * {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;

    /* Theme CSS Variables */
    --a2ui-primary: #667eea;
    --a2ui-primary-dark: #764ba2;
    --a2ui-success: #4CAF50;
    --a2ui-warning: #FF9800;
    --a2ui-danger: #F44336;
    --a2ui-info: #2196F3;
    --a2ui-text: #1a1a1a;
    --a2ui-text-muted: #666666;
    --a2ui-border: #e0e0e0;
    --a2ui-bg: #ffffff;
  }
`

// ============================================
// A2UI Card Component
// ============================================
@customElement('a2ui-card')
export class A2UICard extends LitElement {
  @property({ type: String }) cardType: 'info' | 'success' | 'warning' | 'danger' | 'primary' = 'info'
  @property({ type: String }) elevation: 'low' | 'medium' | 'high' = 'medium'
  @property({ type: Boolean }) animate = false

  static styles = [
    baseStyles,
    css`
      :host {
        --card-bg: #ffffff;
        --card-border: #e0e0e0;
        --card-shadow: rgba(0, 0, 0, 0.1);
      }

      .card {
        background: var(--card-bg);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--accent-color, #667eea);
      }

      /* Elevation */
      .elevation-low {
        box-shadow: 0 2px 4px var(--card-shadow);
      }
      .elevation-medium {
        box-shadow: 0 4px 12px var(--card-shadow);
      }
      .elevation-high {
        box-shadow: 0 8px 24px var(--card-shadow);
      }

      /* Card Types */
      .type-info { --accent-color: #2196F3; }
      .type-success { --accent-color: #4CAF50; }
      .type-warning { --accent-color: #FF9800; }
      .type-danger { --accent-color: #F44336; }
      .type-primary { --accent-color: #667eea; }

      /* Animation */
      .animate {
        animation: slideIn 0.4s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--card-shadow);
      }
    `
  ]

  render() {
    return html`
      <div class="card elevation-${this.elevation} type-${this.cardType} ${this.animate ? 'animate' : ''}">
        <slot></slot>
      </div>
    `
  }
}

// ============================================
// A2UI Text Component
// ============================================
@customElement('a2ui-text')
export class A2UIText extends LitElement {
  @property({ type: String }) variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' = 'body'
  @property({ type: String }) color = ''

  static styles = [
    baseStyles,
    css`
      .text {
        margin: 0;
        line-height: 1.5;
      }

      .h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
      .h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
      .h3 { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
      .h4 { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
      .body { font-size: 14px; font-weight: 400; }
      .caption { font-size: 12px; font-weight: 400; color: #666; }
    `
  ]

  render() {
    const style = this.color ? `color: ${this.color}` : ''
    return html`
      <p class="text ${this.variant}" style=${style || nothing}>
        <slot></slot>
      </p>
    `
  }
}

// ============================================
// A2UI Icon Component
// ============================================
@customElement('a2ui-icon')
export class A2UIIcon extends LitElement {
  @property({ type: String }) icon = ''
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium'

  static styles = [
    baseStyles,
    css`
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .small { font-size: 16px; }
      .medium { font-size: 24px; }
      .large { font-size: 32px; }
    `
  ]

  render() {
    return html`<span class="icon ${this.size}">${this.icon}</span>`
  }
}

// ============================================
// A2UI Button Component
// ============================================
@customElement('a2ui-button')
export class A2UIButton extends LitElement {
  @property({ type: String }) variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary'
  @property({ type: Boolean }) disabled = false
  @property({ type: String }) icon = ''

  static styles = [
    baseStyles,
    css`
      .button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }

      .secondary {
        background: #f0f0f0;
        color: #333;
      }
      .secondary:hover { background: #e0e0e0; }

      .outline {
        background: transparent;
        border: 2px solid #667eea;
        color: #667eea;
      }
      .outline:hover { background: rgba(102, 126, 234, 0.1); }

      .text {
        background: transparent;
        color: #667eea;
        padding: 8px 16px;
      }
      .text:hover { background: rgba(102, 126, 234, 0.1); }

      .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .icon { font-size: 18px; }
    `
  ]

  render() {
    return html`
      <button class="button ${this.variant}" ?disabled=${this.disabled}>
        ${this.icon ? html`<span class="icon">${this.icon}</span>` : nothing}
        <slot></slot>
      </button>
    `
  }
}

// ============================================
// A2UI Row/Column Layout
// ============================================
@customElement('a2ui-row')
export class A2UIRow extends LitElement {
  @property({ type: String }) gap = '12px'
  @property({ type: String }) align: 'start' | 'center' | 'end' | 'stretch' = 'center'
  @property({ type: String }) justify: 'start' | 'center' | 'end' | 'between' | 'around' = 'start'

  // 静的マップ（パフォーマンス最適化）
  private static readonly JUSTIFY_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around'
  }

  static styles = [
    baseStyles,
    css`
      .row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
    `
  ]

  render() {
    return html`
      <div class="row" style="gap: ${this.gap}; align-items: ${this.align}; justify-content: ${A2UIRow.JUSTIFY_MAP[this.justify]};">
        <slot></slot>
      </div>
    `
  }
}

@customElement('a2ui-column')
export class A2UIColumn extends LitElement {
  @property({ type: String }) gap = '12px'

  static styles = [
    baseStyles,
    css`
      .column {
        display: flex;
        flex-direction: column;
      }
    `
  ]

  render() {
    return html`
      <div class="column" style="gap: ${this.gap};">
        <slot></slot>
      </div>
    `
  }
}

// ============================================
// A2UI Badge Component
// ============================================
@customElement('a2ui-badge')
export class A2UIBadge extends LitElement {
  @property({ type: String }) variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'info'

  static styles = [
    baseStyles,
    css`
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }

      .success { background: #E8F5E9; color: #2E7D32; }
      .warning { background: #FFF3E0; color: #E65100; }
      .danger { background: #FFEBEE; color: #C62828; }
      .info { background: #E3F2FD; color: #1565C0; }
      .neutral { background: #F5F5F5; color: #616161; }
    `
  ]

  render() {
    return html`<span class="badge ${this.variant}"><slot></slot></span>`
  }
}

// ============================================
// A2UI Progress Component
// ============================================
@customElement('a2ui-progress')
export class A2UIProgress extends LitElement {
  @property({ type: Number }) value = 0
  @property({ type: Number }) max = 100
  @property({ type: String }) color = '#667eea'
  @property({ type: Boolean }) showLabel = false

  static styles = [
    baseStyles,
    css`
      .progress-container {
        width: 100%;
      }

      .progress-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .progress-label {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        text-align: right;
      }
    `
  ]

  render() {
    // ゼロ除算防止
    const percentage = this.max > 0 ? Math.min((this.value / this.max) * 100, 100) : 0
    return html`
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%; background: ${this.color};"></div>
        </div>
        ${this.showLabel ? html`<div class="progress-label">${Math.round(percentage)}%</div>` : nothing}
      </div>
    `
  }
}

// ============================================
// A2UI Divider Component
// ============================================
@customElement('a2ui-divider')
export class A2UIDivider extends LitElement {
  @property({ type: String }) spacing = '16px'

  static styles = [
    baseStyles,
    css`
      .divider {
        border: none;
        border-top: 1px solid #e0e0e0;
      }
    `
  ]

  render() {
    return html`<hr class="divider" style="margin: ${this.spacing} 0;" />`
  }
}

// ============================================
// A2UI Avatar Component
// ============================================
@customElement('a2ui-avatar')
export class A2UIAvatar extends LitElement {
  @property({ type: String }) name = ''
  @property({ type: String }) emoji = ''
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium'
  @property({ type: String }) bgColor = '#667eea'

  static styles = [
    baseStyles,
    css`
      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
        font-weight: 600;
      }

      .small { width: 32px; height: 32px; font-size: 14px; }
      .medium { width: 48px; height: 48px; font-size: 20px; }
      .large { width: 64px; height: 64px; font-size: 28px; }
    `
  ]

  render() {
    const initial = this.emoji || (this.name ? this.name.charAt(0).toUpperCase() : '?')
    return html`
      <div class="avatar ${this.size}" style="background: ${this.bgColor};">
        ${initial}
      </div>
    `
  }
}

// Export all components
export const A2UIComponents = {
  A2UICard,
  A2UIText,
  A2UIIcon,
  A2UIButton,
  A2UIRow,
  A2UIColumn,
  A2UIBadge,
  A2UIProgress,
  A2UIDivider,
  A2UIAvatar
}
