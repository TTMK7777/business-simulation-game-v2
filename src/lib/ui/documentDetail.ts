// 社長モード: 書類詳細モーダル
import { CATEGORY_NAMES, PRIORITY_DISPLAY } from '../config/documents'
import { CEO_TRAITS } from '../config/ceo'
import type { ApprovalDocument } from '../types/index'

export function renderDocumentDetail(doc: ApprovalDocument, state: any): string {
  const catName = CATEGORY_NAMES[doc.category] || doc.category
  const priority = PRIORITY_DISPLAY[doc.priority]
  const ceoTrait = state.ceo?.trait || 'analyst'
  const traitConfig = CEO_TRAITS[ceoTrait as keyof typeof CEO_TRAITS]
  const remandsLeft = (state.ceo?.remandsThisWeek || 0) < 1 ? 1 : 0
  const canAffordInvestigation = state.money >= 50000

  // cluesの表示（CEO特性に応じて追加clueを表示）
  let cluesHtml = ''
  if (doc.clues.length > 0) {
    cluesHtml = `
      <div class="doc-clues">
        <h4>📝 気になる点</h4>
        ${doc.clues.map(c => `
          <div class="doc-clue-item">
            <span class="doc-clue-field">${c.field}</span>
            <span class="doc-clue-obs">${c.observation}</span>
          </div>
        `).join('')}
      </div>
    `
  }

  // 調査結果の表示
  let investigationHtml = ''
  if (doc.investigationResult) {
    investigationHtml = `
      <div class="doc-investigation-result">
        <h4>🔍 調査報告</h4>
        <p>${doc.investigationResult}</p>
      </div>
    `
  }

  // 期限表示
  let deadlineHtml = ''
  if (doc.deadline) {
    const turnsLeft = doc.deadline - state.turn
    const urgencyColor = turnsLeft <= 1 ? '#e74c3c' : turnsLeft <= 3 ? '#e67e22' : '#2ecc71'
    deadlineHtml = `<div class="doc-deadline" style="color:${urgencyColor}">⏰ 期限: あと${turnsLeft}ターン</div>`
  }

  // ボタンの無効化状態
  const isProcessed = doc.verdict === 'approve' || doc.verdict === 'reject'
  const buttonsDisabled = isProcessed ? 'disabled' : ''

  return `
    <div class="doc-detail">
      <div class="doc-detail-header">
        <div class="doc-category-badge" style="background:${priority.color}20;color:${priority.color}">
          ${priority.emoji} ${priority.label} | ${catName}
        </div>
        ${deadlineHtml}
      </div>

      <h3 class="doc-detail-title">${doc.title}</h3>

      <div class="doc-submitter">
        <span>提出者: ${doc.submitter.name}（${doc.department}部・${doc.submitter.position}）</span>
      </div>

      <div class="doc-summary">
        <h4>概要</h4>
        <p>${doc.summary}</p>
      </div>

      <div class="doc-details-grid">
        <div class="doc-detail-item">
          <span class="doc-detail-label">💰 金額</span>
          <span class="doc-detail-value">${Math.floor(doc.details.amount / 10000).toLocaleString()}万円</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">📈 期待効果</span>
          <span class="doc-detail-value">${doc.details.expectedBenefit}</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">📅 タイムライン</span>
          <span class="doc-detail-value">${doc.details.timeline}</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">⚠️ リスク</span>
          <span class="doc-detail-value">${doc.details.risks}</span>
        </div>
        ${doc.details.attachments.length > 0 ? `
          <div class="doc-detail-item">
            <span class="doc-detail-label">📎 添付</span>
            <span class="doc-detail-value">${doc.details.attachments.join(', ')}</span>
          </div>
        ` : ''}
      </div>

      ${cluesHtml}
      ${investigationHtml}

      ${!isProcessed ? `
        <div class="doc-verdict-buttons">
          <button class="btn desk-btn approve-btn" onclick="verdictDocument('${doc.id}','approve')" ${buttonsDisabled}>
            ✅ 承認
          </button>
          <button class="btn desk-btn reject-btn" onclick="verdictDocument('${doc.id}','reject')" ${buttonsDisabled}>
            ❌ 却下
          </button>
          <button class="btn desk-btn hold-btn" onclick="verdictDocument('${doc.id}','hold')" ${buttonsDisabled}>
            ⏸️ 保留
          </button>
          <button class="btn desk-btn remand-btn" onclick="verdictDocument('${doc.id}','remand')" ${buttonsDisabled} ${remandsLeft <= 0 ? 'disabled title="今週の差し戻し上限に達しています"' : ''}>
            🔄 差し戻し(残${remandsLeft}回)
          </button>
          <button class="btn desk-btn investigate-btn" onclick="verdictDocument('${doc.id}','investigate')" ${buttonsDisabled} ${!canAffordInvestigation ? 'disabled title="調査費用が不足しています"' : ''}>
            🔍 調査(5万円)
          </button>
        </div>
      ` : `
        <div class="doc-verdict-result">
          <p>${doc.outcome?.description || '処理済み'}</p>
        </div>
      `}
    </div>
  `
}

export function renderVerdictResult(doc: ApprovalDocument): string {
  if (!doc.outcome) return ''

  const changes: string[] = []
  if (doc.outcome.moneyChange !== 0) {
    const color = doc.outcome.moneyChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">💰 ${doc.outcome.moneyChange >= 0 ? '+' : ''}${Math.floor(doc.outcome.moneyChange / 10000)}万円</span>`)
  }
  if (doc.outcome.ceoApprovalChange !== 0) {
    const color = doc.outcome.ceoApprovalChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">📊 支持率 ${doc.outcome.ceoApprovalChange >= 0 ? '+' : ''}${doc.outcome.ceoApprovalChange}</span>`)
  }
  if (doc.outcome.marketShareChange !== 0) {
    const color = doc.outcome.marketShareChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">📈 シェア ${doc.outcome.marketShareChange >= 0 ? '+' : ''}${doc.outcome.marketShareChange.toFixed(1)}%</span>`)
  }
  if (doc.outcome.employeeMoraleChange !== 0) {
    const color = doc.outcome.employeeMoraleChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">😊 士気 ${doc.outcome.employeeMoraleChange >= 0 ? '+' : ''}${doc.outcome.employeeMoraleChange}</span>`)
  }

  return `
    <div class="verdict-result">
      <h4>📋 決裁結果</h4>
      <p>${doc.outcome.description}</p>
      <div class="verdict-changes">
        ${changes.join(' | ')}
      </div>
    </div>
  `
}
