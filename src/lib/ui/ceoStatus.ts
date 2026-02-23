// 社長モード: KPIバー・CEO情報・四半期レビュー・方針選択UI
import { CEO_TRAITS, POLICY_FOCUSES } from '../config/ceo'
import type { PolicyFocus } from '../types/index'

export function renderCEOKPIBar(state: any): string {
  if (!state.ceo) return ''

  const ceo = state.ceo
  const traitConfig = CEO_TRAITS[ceo.trait as keyof typeof CEO_TRAITS]
  const approvalColor = ceo.approvalRating > 60 ? '#2ecc71' : ceo.approvalRating > 30 ? '#f1c40f' : '#e74c3c'
  const policyDisplay = ceo.currentPolicy
    ? ceo.currentPolicy.focus.map((f: PolicyFocus) => `${POLICY_FOCUSES[f].emoji}${POLICY_FOCUSES[f].name}`).join(' ')
    : '未設定'

  return `
    <div class="ceo-kpi-bar">
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">支持率</span>
        <div class="ceo-kpi-bar-wrap">
          <div class="ceo-kpi-bar-fill" style="width:${ceo.approvalRating}%;background:${approvalColor}"></div>
        </div>
        <span class="ceo-kpi-value" style="color:${approvalColor}">${Math.floor(ceo.approvalRating)}%</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">株価</span>
        <span class="ceo-kpi-value">¥${ceo.stockPrice.toLocaleString()}</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">資金</span>
        <span class="ceo-kpi-value">${Math.floor(state.money / 10000).toLocaleString()}万</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">社員</span>
        <span class="ceo-kpi-value">${state.employees.length}名</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">シェア</span>
        <span class="ceo-kpi-value">${(state.marketShare || 0).toFixed(1)}%</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">${state.year}年${state.month}月 第${state.week}週</span>
        <span class="ceo-kpi-value">${traitConfig.emoji} ${traitConfig.name}</span>
      </div>
      <div class="ceo-kpi-policy">
        <span class="ceo-kpi-label">方針</span>
        <span class="ceo-kpi-value">${policyDisplay}</span>
      </div>
    </div>
  `
}

export function renderQuarterlyReview(state: any): string {
  if (!state.ceo?.quarterlyReview) return ''

  const review = state.ceo.quarterlyReview
  const gradeColors: Record<string, string> = {
    S: '#ffd700', A: '#2ecc71', B: '#3498db', C: '#f1c40f', D: '#e67e22', F: '#e74c3c'
  }

  return `
    <div class="quarterly-review-modal">
      <h3>📊 四半期業績レビュー</h3>
      <div class="quarterly-grade" style="color:${gradeColors[review.grade] || '#666'}">
        ${review.grade}
      </div>
      <div class="quarterly-details">
        <div class="quarterly-item">
          <span>売上</span>
          <span>${Math.floor(review.revenue / 10000).toLocaleString()}万円</span>
        </div>
        <div class="quarterly-item">
          <span>利益</span>
          <span style="color:${review.profit >= 0 ? '#2ecc71' : '#e74c3c'}">${Math.floor(review.profit / 10000).toLocaleString()}万円</span>
        </div>
        <div class="quarterly-item">
          <span>社員満足度</span>
          <span>${review.employeeSatisfaction}%</span>
        </div>
        <div class="quarterly-item">
          <span>方針整合度</span>
          <span>${review.policyAlignment}%</span>
        </div>
      </div>
    </div>
  `
}

export function renderPolicySelection(state: any): string {
  const focuses = Object.entries(POLICY_FOCUSES) as [PolicyFocus, any][]
  const currentFocus = state.ceo?.currentPolicy?.focus || []

  return `
    <div class="policy-selection">
      <h3>🎯 経営方針を選択してください（2〜3個）</h3>
      <p style="color:#666;font-size:13px;margin-bottom:16px;">方針に沿った書類の承認でボーナスが得られます。方針は書類の発生頻度にも影響します。</p>
      <div class="policy-grid">
        ${focuses.map(([key, config]) => `
          <div class="policy-option ${currentFocus.includes(key) ? 'selected' : ''}"
               onclick="togglePolicyFocus('${key}')" data-policy="${key}">
            <div class="policy-emoji">${config.emoji}</div>
            <div class="policy-name">${config.name}</div>
            <div class="policy-desc">${config.description}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:16px;">
        <button class="btn desk-btn" onclick="confirmPolicySelection()">方針を決定</button>
      </div>
    </div>
  `
}

export function renderCEOTraitSelection(): string {
  const traits = Object.entries(CEO_TRAITS)

  return `
    <div class="ceo-trait-selection">
      <h2 style="text-align:center;margin-bottom:8px;">🏢 CEO特性を選択</h2>
      <p style="text-align:center;color:#666;font-size:13px;margin-bottom:20px;">選んだ特性がゲーム全体に影響します</p>
      <div class="trait-grid">
        ${traits.map(([key, config]) => `
          <div class="trait-option" onclick="selectCEOTrait('${key}')" data-trait="${key}">
            <div class="trait-emoji">${config.emoji}</div>
            <div class="trait-name">${config.name}</div>
            <div class="trait-desc">${config.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export function renderDirectivePanel(state: any): string {
  const departments = [
    { key: 'development', name: '開発部', emoji: '💻', directives: [
      { type: 'product_plan', label: '新製品企画を出させる' },
      { type: 'equipment', label: '技術調査を指示' }
    ]},
    { key: 'sales', name: '営業部', emoji: '📈', directives: [
      { type: 'hiring', label: '採用計画を提出させる' },
      { type: 'marketing', label: 'マーケティング施策を指示' }
    ]},
    { key: 'planning', name: '企画部', emoji: '💡', directives: [
      { type: 'new_business', label: '新規事業案を募集' },
      { type: 'partnership', label: '提携先を調査させる' }
    ]},
    { key: 'management', name: '管理部', emoji: '📊', directives: [
      { type: 'cost_cut', label: 'コスト見直しを指示' },
      { type: 'budget', label: '予算報告を提出させる' }
    ]}
  ]

  return `
    <div class="directive-panel">
      <h3>📢 部門への指示</h3>
      <p style="color:#666;font-size:13px;margin-bottom:12px;">指示を出すと、次のターンに対応する書類が提出されます。</p>
      ${departments.map(dept => {
        const empCount = (state.employees || []).filter((e: any) => e.department === dept.key).length
        return `
          <div class="directive-dept">
            <div class="directive-dept-header">
              ${dept.emoji} ${dept.name} <span style="color:#999;font-size:12px;">(${empCount}名)</span>
            </div>
            <div class="directive-actions">
              ${dept.directives.map(d => `
                <button class="btn desk-btn-small" onclick="issueDirectiveAction('${dept.key}','${d.type}')">
                  ${d.label}
                </button>
              `).join('')}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}
