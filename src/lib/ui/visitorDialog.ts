// 社長モード: 訪問者会話UI
import { MOOD_DISPLAY } from '../config/visitors'
import type { VisitorEvent } from '../types/index'

export function renderVisitorDialog(event: VisitorEvent): string {
  const mood = MOOD_DISPLAY[event.visitor.mood] || MOOD_DISPLAY.calm

  return `
    <div class="visitor-dialog">
      <div class="visitor-header">
        <div class="visitor-icon">${mood.emoji}</div>
        <div class="visitor-info">
          <div class="visitor-name">${event.visitor.name}</div>
          <div class="visitor-meta">${event.visitor.department}部・${event.visitor.position} | ${mood.label}</div>
        </div>
      </div>

      <div class="visitor-title">${event.title}</div>

      <div class="visitor-dialog-lines">
        ${event.dialogLines.map(line => `
          <div class="visitor-dialog-line">
            <span class="dialog-speaker">${event.visitor.name}:</span>
            <span class="dialog-text">「${line}」</span>
          </div>
        `).join('')}
      </div>

      ${event.documentClueToAdd ? `
        <div class="visitor-clue-hint">
          <span>💡</span>
          <span>この訪問者は未処理の書類に関する情報を持っているようです。</span>
        </div>
      ` : ''}

      <div class="visitor-responses">
        <h4>あなたの対応:</h4>
        ${event.responses.map(resp => {
          const toneEmoji = resp.tone === 'supportive' ? '😊' : resp.tone === 'harsh' ? '😤' : resp.tone === 'diplomatic' ? '🤔' : '😐'
          const toneLabel = resp.tone === 'supportive' ? '好意的' : resp.tone === 'harsh' ? '厳しい' : resp.tone === 'diplomatic' ? '外交的' : '中立'
          return `
            <button class="visitor-response-btn" onclick="respondToVisitor('${event.id}','${resp.id}')">
              <span class="response-tone">${toneEmoji} ${toneLabel}</span>
              <span class="response-text">${resp.text}</span>
            </button>
          `
        }).join('')}
      </div>
    </div>
  `
}

export function renderVisitorResult(event: VisitorEvent, effects: any): string {
  const changes: string[] = []

  if (effects.ceoApprovalChange) {
    const color = effects.ceoApprovalChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">📊 支持率 ${effects.ceoApprovalChange >= 0 ? '+' : ''}${effects.ceoApprovalChange}</span>`)
  }
  if (effects.visitorMoraleChange) {
    const color = effects.visitorMoraleChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">😊 訪問者の気持ち ${effects.visitorMoraleChange >= 0 ? '+' : ''}${effects.visitorMoraleChange}</span>`)
  }
  if (effects.companyCultureChange) {
    const color = effects.companyCultureChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">🏢 社風 ${effects.companyCultureChange >= 0 ? '+' : ''}${effects.companyCultureChange}</span>`)
  }
  if (effects.moneyChange) {
    const color = effects.moneyChange >= 0 ? '#2ecc71' : '#e74c3c'
    changes.push(`<span style="color:${color}">💰 ${effects.moneyChange >= 0 ? '+' : ''}${Math.floor(effects.moneyChange / 10000)}万円</span>`)
  }

  return `
    <div class="visitor-result">
      <h4>訪問者対応完了</h4>
      <p>${event.visitor.name}への対応が完了しました。</p>
      <div class="visitor-result-changes">
        ${changes.join(' | ')}
      </div>
    </div>
  `
}
