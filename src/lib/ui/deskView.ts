// 社長モード: デスクビュー（メインUI）
import { CATEGORY_NAMES, PRIORITY_DISPLAY } from '../config/documents'
import { renderCEOKPIBar } from './ceoStatus'
import type { ApprovalDocument } from '../types/index'

export function renderDeskView(state: any): string {
  const kpiBar = renderCEOKPIBar(state)
  const docCount = (state.documentQueue || []).filter((d: ApprovalDocument) => d.verdict === null || d.verdict === 'hold').length
  const investigatingCount = (state.documentQueue || []).filter((d: ApprovalDocument) => d.underInvestigation).length
  const remandsLeft = 1 - (state.ceo?.remandsThisWeek || 0)

  return `
    ${kpiBar}

    <div class="desk-tabs">
      <button class="desk-tab active" onclick="switchDeskTab('documents')">📥 書類(${docCount}件)</button>
      <button class="desk-tab" onclick="switchDeskTab('status')">📊 経営状況</button>
      <button class="desk-tab" onclick="switchDeskTab('employees')">👥 社員</button>
      <button class="desk-tab" onclick="switchDeskTab('directives')">📢 部門指示</button>
    </div>

    <div id="deskTabContent">
      ${renderDocumentStack(state)}
    </div>

    <div class="desk-footer">
      <div class="desk-footer-info">
        差し戻し残: ${remandsLeft}回/週 | 調査中: ${investigatingCount}件
      </div>
      <button class="btn desk-btn next-turn-btn" onclick="nextTurn()">⏭️ 次の週へ</button>
      <button class="btn desk-btn" onclick="saveGame()">💾 保存</button>
      <button class="btn desk-btn" onclick="returnToMenu()" style="background:rgba(255,255,255,0.3)">🏠 メニュー</button>
    </div>
  `
}

export function renderDocumentStack(state: any): string {
  const docs = (state.documentQueue || []) as ApprovalDocument[]
  const pendingDocs = docs.filter(d => d.verdict === null && !d.underInvestigation)
  const holdDocs = docs.filter(d => d.verdict === 'hold')
  const investigatingDocs = docs.filter(d => d.underInvestigation)

  if (pendingDocs.length === 0 && holdDocs.length === 0 && investigatingDocs.length === 0) {
    return `
      <div class="desk-empty">
        <div class="desk-empty-icon">📭</div>
        <p>処理すべき書類はありません</p>
        <p style="font-size:13px;color:#999;">「次の週へ」で新しい書類が届きます</p>
      </div>
    `
  }

  let html = '<div class="document-stack">'

  // 未処理書類
  if (pendingDocs.length > 0) {
    html += '<div class="doc-section-label">📋 未処理</div>'
    html += pendingDocs.map(doc => renderDocumentCard(doc, state)).join('')
  }

  // 保留書類
  if (holdDocs.length > 0) {
    html += '<div class="doc-section-label">⏸️ 保留中</div>'
    html += holdDocs.map(doc => renderDocumentCard(doc, state)).join('')
  }

  // 調査中書類
  if (investigatingDocs.length > 0) {
    html += '<div class="doc-section-label">🔍 調査中</div>'
    html += investigatingDocs.map(doc => renderDocumentCard(doc, state, true)).join('')
  }

  html += '</div>'
  return html
}

function renderDocumentCard(doc: ApprovalDocument, state: any, isInvestigating = false): string {
  const priority = PRIORITY_DISPLAY[doc.priority]
  const catName = CATEGORY_NAMES[doc.category] || doc.category

  let deadlineHtml = ''
  if (doc.deadline) {
    const turnsLeft = doc.deadline - state.turn
    const urgencyColor = turnsLeft <= 1 ? '#e74c3c' : turnsLeft <= 3 ? '#e67e22' : '#2ecc71'
    deadlineHtml = `<span class="doc-card-deadline" style="color:${urgencyColor}">⏰ 残${turnsLeft}T</span>`
  }

  return `
    <div class="doc-card ${isInvestigating ? 'investigating' : ''}" onclick="openDocument('${doc.id}')">
      <div class="doc-card-priority" style="background:${priority.color}">${priority.emoji}</div>
      <div class="doc-card-content">
        <div class="doc-card-title">${doc.title}</div>
        <div class="doc-card-meta">
          ${doc.department}部 ${doc.submitter.name} | ${catName} | 💰${Math.floor(doc.details.amount / 10000)}万円
        </div>
      </div>
      <div class="doc-card-right">
        ${deadlineHtml}
        ${isInvestigating ? '<span class="doc-card-badge">🔍調査中</span>' : ''}
      </div>
    </div>
  `
}

// 経営状況タブ
export function renderStatusTab(state: any): string {
  const ceo = state.ceo
  if (!ceo) return '<p>CEOデータがありません</p>'

  const correctRate = ceo.decisionsCorrect + ceo.decisionsWrong > 0
    ? Math.floor(ceo.decisionsCorrect / (ceo.decisionsCorrect + ceo.decisionsWrong) * 100)
    : 0

  return `
    <div class="status-panel">
      <div class="status-section">
        <h4>📊 CEO成績</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>正確な判断</span><span>${ceo.decisionsCorrect}回</span>
          </div>
          <div class="status-item">
            <span>誤った判断</span><span>${ceo.decisionsWrong}回</span>
          </div>
          <div class="status-item">
            <span>正答率</span><span>${correctRate}%</span>
          </div>
          <div class="status-item">
            <span>罠を発見</span><span>${ceo.trapsDetected}回</span>
          </div>
          <div class="status-item">
            <span>罠を見逃し</span><span>${ceo.trapsMissed}回</span>
          </div>
          <div class="status-item">
            <span>調査費用合計</span><span>${Math.floor(ceo.investigationBudget / 10000)}万円</span>
          </div>
        </div>
      </div>

      <div class="status-section">
        <h4>🏢 会社状況</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>社風</span>
            <div class="status-bar-wrap">
              <div class="status-bar-fill" style="width:${state.companyCulture || 50}%;background:#3498db"></div>
            </div>
            <span>${state.companyCulture || 50}</span>
          </div>
          <div class="status-item">
            <span>スキャンダルリスク</span>
            <div class="status-bar-wrap">
              <div class="status-bar-fill" style="width:${state.scandalRisk || 0}%;background:#e74c3c"></div>
            </div>
            <span>${state.scandalRisk || 0}</span>
          </div>
          <div class="status-item">
            <span>処理書類数</span><span>${state.documentStats?.totalProcessed || 0}</span>
          </div>
          <div class="status-item">
            <span>承認数</span><span>${state.documentStats?.totalApproved || 0}</span>
          </div>
          <div class="status-item">
            <span>却下数</span><span>${state.documentStats?.totalRejected || 0}</span>
          </div>
        </div>
      </div>

      ${ceo.quarterlyReview ? `
        <div class="status-section">
          <h4>📋 直近の四半期評価</h4>
          <div class="quarterly-mini-grade">${ceo.quarterlyReview.grade}</div>
        </div>
      ` : ''}
    </div>
  `
}
