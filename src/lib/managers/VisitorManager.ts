// 社長モード: 訪問イベント生成・処理
import type { VisitorEvent, VisitorResponse } from '../types/index'
import { VISITOR_TEMPLATES, VERDICT_LINKED_VISITOR_TEMPLATES, MOOD_DISPLAY } from '../config/visitors'
import { CEO_BALANCE } from '../config/ceo'

let visitorIdCounter = 0

function generateId(): string {
  return `vis_${Date.now()}_${++visitorIdCounter}`
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

// 訪問者候補を生成（既存社員 or ランダム）
function selectVisitor(state: any, template: any): {
  employeeId: number | null; name: string; position: string; department: string; personalityKey?: string
} {
  const employees = state.employees || []

  // 特定条件のテンプレートでは関連社員を優先
  if (template.type === 'consultation' && template.triggerCondition) {
    const candidate = employees.find((e: any) => e.motivation < 50)
    if (candidate) {
      const posNames: Record<string, string> = { staff: '社員', senior: '主任', manager: '課長', director: '部長' }
      const deptNames: Record<string, string> = { development: '開発', sales: '営業', planning: '企画', management: '管理' }
      return {
        employeeId: candidate.id,
        name: candidate.name,
        position: posNames[candidate.position] || '社員',
        department: deptNames[candidate.department] || '開発',
        personalityKey: candidate.personalityKey
      }
    }
  }

  // ランダム社員
  if (employees.length > 0 && Math.random() < 0.6) {
    const emp = pickRandom(employees)
    const posNames: Record<string, string> = { staff: '社員', senior: '主任', manager: '課長', director: '部長' }
    const deptNames: Record<string, string> = { development: '開発', sales: '営業', planning: '企画', management: '管理' }
    return {
      employeeId: emp.id,
      name: emp.name,
      position: posNames[emp.position] || '社員',
      department: deptNames[emp.department] || '開発',
      personalityKey: emp.personalityKey
    }
  }

  // ランダム生成
  const names = ['田中 太郎', '鈴木 智子', '佐藤 健太', '高橋 美咲', '伊藤 直樹', '山本 愛子']
  const positions = ['課長', '部長', '主任']
  const departments = ['開発', '営業', '企画', '管理']
  return {
    employeeId: null,
    name: pickRandom(names),
    position: pickRandom(positions),
    department: pickRandom(departments)
  }
}

export function checkForVisitor(state: any, forcedType?: string): VisitorEvent | null {
  // 基本確率チェック
  if (!forcedType && Math.random() > CEO_BALANCE.visitorBaseChance) {
    return null
  }

  // テンプレート選択
  let selectedTemplate: any = null

  if (forcedType) {
    // 決裁連動の強制訪問
    const linked = VERDICT_LINKED_VISITOR_TEMPLATES.find(v => v.template.type === forcedType)
    if (linked) {
      selectedTemplate = linked.template
    }
  }

  if (!selectedTemplate) {
    // 通常の重み付き選択
    const eligibleTemplates = VISITOR_TEMPLATES.filter(t => {
      if (t.triggerCondition && !t.triggerCondition(state)) return false
      return true
    })

    if (eligibleTemplates.length === 0) return null

    const totalWeight = eligibleTemplates.reduce((sum, t) => sum + t.weight, 0)
    let random = Math.random() * totalWeight
    for (const template of eligibleTemplates) {
      random -= template.weight
      if (random <= 0) {
        selectedTemplate = template
        break
      }
    }
    if (!selectedTemplate) selectedTemplate = eligibleTemplates[eligibleTemplates.length - 1]
  }

  // 訪問者を選択
  const visitor = selectVisitor(state, selectedTemplate)
  const mood = pickRandom(selectedTemplate.moods)

  const vars: Record<string, string | number> = {
    name: visitor.name,
    department: visitor.department,
    position: visitor.position,
    status: pickRandom(['順調', '遅延気味', '前倒し']),
    condition: pickRandom(['意欲的に', '淡々と', '苦戦しながら']),
    company: pickRandom(['テックコープ', 'デジタルワークス', 'イノバテック']),
    count: Math.floor(Math.random() * 3) + 1,
    targetName: pickRandom(['佐藤 健太', '高橋 美咲', '山本 愛子'])
  }

  // レスポンス生成
  const responses: VisitorResponse[] = selectedTemplate.responsesTemplate.map((rt: any, idx: number) => ({
    id: `resp_${idx}`,
    text: rt.text,
    tone: rt.tone,
    effects: { ...rt.effects }
  }))

  // CEO特性による訪問者対応効果調整
  if (state.ceo?.trait === 'people_person') {
    for (const resp of responses) {
      if (resp.tone === 'supportive') {
        resp.effects.visitorMoraleChange = Math.floor(resp.effects.visitorMoraleChange * 1.5)
        resp.effects.ceoApprovalChange = Math.floor((resp.effects.ceoApprovalChange || 0) * 1.5)
      }
    }
  }

  // 訪問者が pending 書類に関する情報を漏らす可能性
  let documentClueToAdd: { field: string; observation: string } | undefined
  let relatedDocumentId: string | undefined
  if (state.documentQueue && state.documentQueue.length > 0 && Math.random() < 0.3) {
    const relatedDoc = pickRandom(state.documentQueue)
    relatedDocumentId = relatedDoc.id
    if (relatedDoc.nature === 'clear_bad') {
      documentClueToAdd = {
        field: '訪問者の発言',
        observation: `${visitor.name}が「${relatedDoc.title}」について「あの案件、ちょっと気になる点がある」と漏らした`
      }
    } else {
      documentClueToAdd = {
        field: '訪問者の発言',
        observation: `${visitor.name}が「${relatedDoc.title}」について「あれは良い案だと思う」と述べた`
      }
    }
  }

  return {
    id: generateId(),
    type: selectedTemplate.type,
    visitor: {
      employeeId: visitor.employeeId,
      name: visitor.name,
      position: visitor.position,
      department: visitor.department,
      mood,
      personalityKey: visitor.personalityKey
    },
    title: fillTemplate(selectedTemplate.titleTemplate, vars),
    description: fillTemplate(selectedTemplate.descriptionTemplate, vars),
    dialogLines: selectedTemplate.dialogTemplates.map((d: string) => fillTemplate(d, vars)),
    responses,
    resolved: false,
    relatedDocumentId,
    documentClueToAdd
  }
}

export function processResponse(state: any, eventId: string, responseId: string): {
  outcome: string; effects: any
} | null {
  const event = state.currentVisitor?.id === eventId ? state.currentVisitor : null
  if (!event) return null

  const response = event.responses.find((r: VisitorResponse) => r.id === responseId)
  if (!response) return null

  event.resolved = true
  event.chosenResponseId = responseId

  // 効果適用
  const effects = response.effects

  // CEO支持率
  if (effects.ceoApprovalChange) {
    state.ceo.approvalRating = Math.max(0, Math.min(100, state.ceo.approvalRating + effects.ceoApprovalChange))
  }

  // 社風
  if (effects.companyCultureChange) {
    state.companyCulture = Math.max(0, Math.min(100, (state.companyCulture || 50) + effects.companyCultureChange))
  }

  // 資金
  if (effects.moneyChange) {
    state.money += effects.moneyChange
  }

  // 訪問者が社員の場合、モチベーション更新
  if (event.visitor.employeeId && effects.visitorMoraleChange) {
    const emp = state.employees.find((e: any) => e.id === event.visitor.employeeId)
    if (emp) {
      emp.motivation = Math.max(10, Math.min(100, emp.motivation + effects.visitorMoraleChange))
    }
  }

  // 特殊効果
  if (effects.specialEffect) {
    handleSpecialEffect(state, effects.specialEffect, event)
  }

  // 書類へのclue追加
  if (event.documentClueToAdd && event.relatedDocumentId) {
    const relatedDoc = state.documentQueue.find((d: any) => d.id === event.relatedDocumentId)
    if (relatedDoc) {
      relatedDoc.clues.push(event.documentClueToAdd)
    }
  }

  // 訪問履歴に追加
  state.visitorHistory.push({ ...event })
  state.currentVisitor = null

  return {
    outcome: `${response.tone === 'supportive' ? '好意的' : response.tone === 'harsh' ? '厳しい' : '中立的'}な対応をしました。`,
    effects
  }
}

function handleSpecialEffect(state: any, effect: string, event: VisitorEvent) {
  switch (effect) {
    case 'prevent_resignation':
      if (event.visitor.employeeId) {
        const emp = state.employees.find((e: any) => e.id === event.visitor.employeeId)
        if (emp) emp.motivation = Math.max(emp.motivation, 50)
      }
      break
    case 'increase_leave_risk':
      if (event.visitor.employeeId) {
        const emp = state.employees.find((e: any) => e.id === event.visitor.employeeId)
        if (emp) emp.leaveProbability = (emp.leaveProbability || 0) + 0.3
      }
      break
    case 'trigger_scandal':
      state.scandalRisk = Math.min(100, (state.scandalRisk || 0) + 20)
      break
    case 'reduce_scandal_risk':
      state.scandalRisk = Math.max(0, (state.scandalRisk || 0) - 30)
      break
    case 'partial_reduce_scandal':
      state.scandalRisk = Math.max(0, (state.scandalRisk || 0) - 10)
      break
    case 'increase_scandal_risk':
      state.scandalRisk = Math.min(100, (state.scandalRisk || 0) + 15)
      break
    case 'prevent_poaching':
      // 全社員のモチベーションを少し上げる
      state.employees.forEach((e: any) => {
        e.motivation = Math.min(100, (e.motivation || 50) + 5)
      })
      break
  }
}

export function pruneVisitorHistory(state: any): void {
  if (state.visitorHistory.length > CEO_BALANCE.maxVisitorHistory) {
    state.visitorHistory.splice(0, state.visitorHistory.length - CEO_BALANCE.maxVisitorHistory)
  }
}
