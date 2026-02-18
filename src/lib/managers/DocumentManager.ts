// 社長モード: 書類生成・判定・結果反映
import type { ApprovalDocument, DocumentCategory, DocumentNature, DocumentVerdict, DocumentOutcome, DocumentClue } from '../types/index'
import { DOCUMENT_TEMPLATES, SITUATION_MODIFIERS, CAUSAL_CHAINS, CATEGORY_NAMES, TRAP_NAMES } from '../config/documents'
import { CEO_BALANCE } from '../config/ceo'
import { POLICY_FOCUSES } from '../config/ceo'

let docIdCounter = 0

function generateId(): string {
  return `doc_${Date.now()}_${++docIdCounter}`
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// カテゴリ重みを計算（経営状況 + 方針に基づく）
function getCategoryWeights(state: any): Map<DocumentCategory, number> {
  const weights = new Map<DocumentCategory, number>()
  const categories: DocumentCategory[] = [
    'hiring', 'budget', 'product_plan', 'marketing', 'equipment',
    'personnel_change', 'promotion', 'training', 'salary_raise',
    'new_business', 'cost_cut', 'partnership'
  ]

  // 基本重み
  categories.forEach(c => weights.set(c, 1.0))

  // 状況に応じた重み調整
  if (state.employees.length < 5) {
    weights.set('hiring', (weights.get('hiring') || 1) * 2.0)
    weights.set('personnel_change', (weights.get('personnel_change') || 1) * 0.3)
  }
  if (state.products.length === 0) {
    weights.set('product_plan', (weights.get('product_plan') || 1) * 2.5)
  }
  if (state.money < 3000000) {
    weights.set('cost_cut', (weights.get('cost_cut') || 1) * 2.0)
    weights.set('new_business', (weights.get('new_business') || 1) * 0.5)
  }
  if (state.marketShare < 5) {
    weights.set('marketing', (weights.get('marketing') || 1) * 1.5)
  }

  // 方針による重み調整
  if (state.ceo?.currentPolicy) {
    const focuses = state.ceo.currentPolicy.focus
    for (const focus of focuses) {
      const config = POLICY_FOCUSES[focus]
      if (config) {
        for (const [cat, mult] of Object.entries(config.documentWeights)) {
          weights.set(cat as DocumentCategory, (weights.get(cat as DocumentCategory) || 1) * mult)
        }
      }
    }
  }

  return weights
}

// 重み付きランダム選択
function weightedRandomCategory(weights: Map<DocumentCategory, number>): DocumentCategory {
  const entries = Array.from(weights.entries())
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0)
  let random = Math.random() * totalWeight
  for (const [category, weight] of entries) {
    random -= weight
    if (random <= 0) return category
  }
  return entries[entries.length - 1][0]
}

// nature分布に基づく選択
function selectNature(state: any): DocumentNature {
  const dist = { ...CEO_BALANCE.natureDistribution }
  const difficulty = state.difficulty || 'normal'
  dist.clear_bad = CEO_BALANCE.trapBaseRate[difficulty] || 0.15

  // ターン経過で罠確率増加
  dist.clear_bad = Math.min(CEO_BALANCE.maxTrapRate, dist.clear_bad + state.turn * CEO_BALANCE.trapGrowthPerTurn)

  // 残りの比率を正規化
  const total = Object.values(dist).reduce((s, v) => s + v, 0)
  let random = Math.random() * total
  for (const [nature, prob] of Object.entries(dist)) {
    random -= prob
    if (random <= 0) return nature as DocumentNature
  }
  return 'clear_good'
}

// submitterを生成（既存社員から or ランダム）
function generateSubmitter(state: any, department: string): { employeeId: number | null; name: string; position: string } {
  const deptEmployees = state.employees.filter((e: any) => e.department === department)
  if (deptEmployees.length > 0 && Math.random() < 0.7) {
    const emp = pickRandom(deptEmployees)
    const positionNames: Record<string, string> = {
      staff: '社員', senior: '主任', manager: '課長', director: '部長'
    }
    return { employeeId: emp.id, name: emp.name, position: positionNames[emp.position] || '社員' }
  }
  // ランダム生成
  const names = ['田中', '鈴木', '佐藤', '高橋', '伊藤', '山本', '中村', '小林', '加藤', '吉田']
  const firstNames = ['太郎', '一郎', '健太', '翔太', '智子', '美咲', '愛子', '優子', '直樹', '拓也']
  const positions = ['課長', '部長', '主任', '係長']
  return {
    employeeId: null,
    name: `${pickRandom(names)} ${pickRandom(firstNames)}`,
    position: pickRandom(positions)
  }
}

// テンプレートのプレースホルダーを置換
function fillTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

// 書類を1件生成
function generateOneDocument(state: any, category: DocumentCategory, nature?: DocumentNature): ApprovalDocument {
  const templates = DOCUMENT_TEMPLATES.filter(t => t.category === category)
  if (templates.length === 0) {
    // フォールバック
    return generateOneDocument(state, 'budget', nature)
  }
  const template = pickRandom(templates)
  const selectedNature = nature || selectNature(state)

  // 金額計算
  let amount = randInt(template.baseAmount.min, template.baseAmount.max)
  let benefit = randInt(template.baseBenefit.min, template.baseBenefit.max)

  // 状況修飾子適用
  for (const mod of SITUATION_MODIFIERS) {
    if (mod.condition(state)) {
      amount = Math.floor(amount * mod.amountMultiplier)
      benefit = Math.floor(benefit * mod.benefitMultiplier)
    }
  }

  const departments = ['開発', '営業', '企画', '管理']
  const dept = pickRandom(departments)
  const submitter = generateSubmitter(state, dept === '開発' ? 'development' : dept === '営業' ? 'sales' : dept === '企画' ? 'planning' : 'management')

  const vars: Record<string, string | number> = {
    department: dept, name: submitter.name, position: submitter.position,
    count: randInt(1, 5), percent: randInt(10, 50), amount: Math.floor(amount / 10000),
    quarter: `第${Math.ceil((state.month || 1) / 3)}`, months: randInt(2, 6),
    productName: pickRandom(['AI分析ツール', 'クラウドCRM', 'セキュリティスイート', 'IoTプラットフォーム', '業務自動化ツール']),
    market: pickRandom(['AI', 'クラウド', 'セキュリティ', 'IoT', 'DX']),
    equipment: pickRandom(['高性能サーバー', '開発用PC', 'セキュリティ機器', 'ネットワーク機器', 'モニター']),
    channel: pickRandom(['Web広告', 'SNS', '展示会', 'セミナー', 'PR']),
    company: pickRandom(['テックコープ', 'デジタルワークス', 'イノバテック', 'フューチャーテック']),
    trainingName: pickRandom(['リーダーシップ', 'プロジェクト管理', 'プログラミング', 'コミュニケーション']),
    businessName: pickRandom(['AIコンサル事業', 'クラウドSaaS事業', 'DX支援事業']),
    type: pickRandom(['技術', '販売', '資本']),
    area: pickRandom(['外注費', '交通費', '通信費', 'オフィス維持費']),
    reason: pickRandom(['緊急のシステム障害対応', '重要顧客からの追加要求', '市場環境の急変']),
    fromDept: dept, toDept: pickRandom(departments.filter(d => d !== dept)),
    fromPosition: '主任', toPosition: '課長',
    country: pickRandom(['アメリカ', 'シンガポール', 'インド', 'ベトナム']),
    ratio: randFloat(0.8, 2.2).toFixed(1),
    timing: pickRandom(['先週', '昨日', '本日朝']),
    years: randInt(1, 3), rank: randInt(1, 20), score: randInt(30, 90),
    status: pickRandom(['ポジティブ', 'ネガティブ', '中立']),
    grade: pickRandom(['S', 'A', 'B', 'C']),
    level: pickRandom(['高い', '中程度', '低い']),
    condition: pickRandom(['売り手市場', '買い手市場', '横ばい']),
    result: pickRandom(['良好', '普通', 'やや不十分']),
    hours: randInt(2, 20), otherPercent: randInt(30, 60)
  }

  // 罠の設定
  let trap = null as any
  let actualAmount = amount
  if (selectedNature === 'clear_bad') {
    trap = pickRandom(template.possibleTraps.filter(t => t !== null)) || 'inflated_cost'
    actualAmount = Math.floor(amount * randFloat(1.3, 2.5))
    benefit = randInt(0, 20)
  }

  // clues生成
  const clues: DocumentClue[] = []
  for (const ct of template.clueTemplates) {
    if (Math.random() < 0.7) {
      clues.push({
        field: fillTemplate(ct.field, vars),
        observation: fillTemplate(ct.observation, vars)
      })
    }
  }
  // 状況修飾子のclue追加
  for (const mod of SITUATION_MODIFIERS) {
    if (mod.condition(state) && mod.extraClue) {
      clues.push(mod.extraClue)
    }
  }

  // gamble / long_term の追加パラメータ
  let gambleSuccessRate: number | undefined
  let longTermBenefit: number | undefined
  let longTermTurns: number | undefined
  if (selectedNature === 'gamble') {
    gambleSuccessRate = randInt(30, 70)
  }
  if (selectedNature === 'long_term') {
    longTermBenefit = Math.floor(amount * randFloat(1.5, 4.0))
    longTermTurns = randInt(6, 16)
  }

  // deadline
  let deadline: number | null = null
  if (template.priority === 'urgent') deadline = state.turn + 1
  else if (template.priority === 'high') deadline = state.turn + 3
  else if (Math.random() < 0.3) deadline = state.turn + randInt(3, 8)

  return {
    id: generateId(),
    category,
    priority: template.priority,
    title: fillTemplate(template.titleTemplate, vars),
    department: dept,
    submitter,
    summary: fillTemplate(template.summaryTemplate, vars),
    details: {
      amount,
      expectedBenefit: fillTemplate(template.benefitTemplate, vars),
      timeline: `${randInt(1, 6)}ヶ月`,
      risks: fillTemplate(template.risksTemplate, vars),
      attachments: Math.random() < 0.5 ? ['見積書.pdf', '企画書.pdf'] : []
    },
    nature: selectedNature,
    trap,
    clues,
    actualAmount: trap ? actualAmount : undefined,
    actualBenefit: benefit,
    gambleSuccessRate,
    longTermBenefit,
    longTermTurns,
    turnSubmitted: state.turn,
    deadline,
    verdict: null,
    resultApplied: false,
    underInvestigation: false
  }
}

// === 公開関数 ===

export function generateDocuments(state: any, count?: number): ApprovalDocument[] {
  const b = CEO_BALANCE
  const numDocs = count ?? Math.min(
    b.maxDocumentsPerTurn,
    b.baseDocumentsPerTurn + Math.floor(state.turn / b.documentsPerTurnGrowth) + Math.floor((state.employees?.length || 0) / b.documentsPerEmployeeGrowth)
  )

  const weights = getCategoryWeights(state)
  const docs: ApprovalDocument[] = []

  for (let i = 0; i < numDocs; i++) {
    const category = weightedRandomCategory(weights)
    docs.push(generateOneDocument(state, category))
  }
  return docs
}

export function generateFromDirective(state: any, directive: string): ApprovalDocument[] {
  // directive例: "development:product_plan", "sales:marketing"
  const [deptKey, categoryStr] = directive.split(':')
  const category = (categoryStr || 'budget') as DocumentCategory
  const docs: ApprovalDocument[] = []
  const count = randInt(1, 2)

  for (let i = 0; i < count; i++) {
    const doc = generateOneDocument(state, category)
    // 部署の人材力で actualBenefit を調整
    const deptEmployees = state.employees.filter((e: any) => e.department === deptKey)
    if (deptEmployees.length > 0) {
      const avgAbility = deptEmployees.reduce((sum: number, e: any) => {
        const abilities = e.abilities || {}
        return sum + (abilities.technical || 0 + abilities.sales || 0 + abilities.planning || 0 + abilities.management || 0) / 4
      }, 0) / deptEmployees.length
      doc.actualBenefit = Math.floor(doc.actualBenefit * (avgAbility / 60))
    } else {
      doc.actualBenefit = Math.floor(doc.actualBenefit * 0.5)
    }
    docs.push(doc)
  }
  return docs
}

export function processVerdict(state: any, docId: string, verdict: DocumentVerdict): DocumentOutcome | null {
  const doc = state.documentQueue.find((d: ApprovalDocument) => d.id === docId)
  if (!doc) return null

  // 差し戻し制限チェック
  if (verdict === 'remand') {
    if (state.ceo.remandsThisWeek >= CEO_BALANCE.maxRemandsPerWeek) {
      return { moneyChange: 0, marketShareChange: 0, brandPowerChange: 0, ceoApprovalChange: 0, employeeMoraleChange: 0, description: '今週の差し戻しは既に上限に達しています。' }
    }
    state.ceo.remandsThisWeek++
    doc.verdict = 'remand'
    // 書類はキューに残る（再提出扱い）
    return {
      moneyChange: 0, marketShareChange: 0, brandPowerChange: 0,
      ceoApprovalChange: CEO_BALANCE.remandCeoPenalty,
      employeeMoraleChange: CEO_BALANCE.remandMoralePenalty,
      description: '書類を差し戻しました。提出者のモチベーションが少し低下しました。'
    }
  }

  // 調査指示
  if (verdict === 'investigate') {
    if (state.money < CEO_BALANCE.investigationCost) {
      return { moneyChange: 0, marketShareChange: 0, brandPowerChange: 0, ceoApprovalChange: 0, employeeMoraleChange: 0, description: '調査費用が不足しています。' }
    }
    doc.underInvestigation = true
    doc.verdict = 'investigate'
    if (doc.deadline) doc.deadline += CEO_BALANCE.investigationDeadlineExtension
    state.money -= CEO_BALANCE.investigationCost
    state.ceo.investigationBudget += CEO_BALANCE.investigationCost
    return {
      moneyChange: -CEO_BALANCE.investigationCost, marketShareChange: 0, brandPowerChange: 0,
      ceoApprovalChange: 0, employeeMoraleChange: 0,
      description: `調査を指示しました（費用: ${Math.floor(CEO_BALANCE.investigationCost / 10000)}万円）。次のターンに結果が判明します。`
    }
  }

  // 保留
  if (verdict === 'hold') {
    doc.verdict = 'hold'
    // キューに残す
    return {
      moneyChange: 0, marketShareChange: 0, brandPowerChange: 0,
      ceoApprovalChange: 0, employeeMoraleChange: -2,
      description: '書類を保留にしました。'
    }
  }

  // 承認 or 却下
  doc.verdict = verdict
  const outcome = calculateOutcome(state, doc, verdict)
  doc.outcome = outcome
  doc.resultApplied = true

  // キューから履歴に移動
  state.documentQueue = state.documentQueue.filter((d: ApprovalDocument) => d.id !== docId)
  state.documentHistory.push(doc)

  // 統計更新
  if (verdict === 'approve') state.documentStats.totalApproved++
  else state.documentStats.totalRejected++
  state.documentStats.totalProcessed++

  // 結果を state に適用
  state.money += outcome.moneyChange
  state.marketShare = Math.max(0, Math.min(60, state.marketShare + outcome.marketShareChange))
  state.brandPower = Math.max(0, Math.min(100, state.brandPower + outcome.brandPowerChange))
  state.ceo.approvalRating = Math.max(0, Math.min(100, state.ceo.approvalRating + outcome.ceoApprovalChange))

  // submitterのモチベーション更新
  if (doc.submitter.employeeId) {
    const emp = state.employees.find((e: any) => e.id === doc.submitter.employeeId)
    if (emp) {
      emp.motivation = Math.max(10, Math.min(100, emp.motivation + outcome.employeeMoraleChange))
    }
  }

  // 罠統計
  if (doc.nature === 'clear_bad') {
    if (verdict === 'reject') {
      state.ceo.trapsDetected++
      state.documentStats.trapsDetected++
    } else {
      state.ceo.trapsMissed++
      state.documentStats.trapsMissed++
      state.scandalRisk = Math.min(100, (state.scandalRisk || 0) + 15)
    }
  }

  // 正解/不正解カウント
  if ((doc.nature === 'clear_good' && verdict === 'approve') || (doc.nature === 'clear_bad' && verdict === 'reject')) {
    state.ceo.decisionsCorrect++
  } else if ((doc.nature === 'clear_good' && verdict === 'reject') || (doc.nature === 'clear_bad' && verdict === 'approve')) {
    state.ceo.decisionsWrong++
  }

  // gamble却下の蓄積
  if (doc.nature === 'gamble' && verdict === 'reject') {
    state.ceo.gamblesRejected++
  }

  // 因果チェーン: 後続イベント登録
  registerCausalChainEffects(state, doc, verdict)

  return outcome
}

function calculateOutcome(state: any, doc: ApprovalDocument, verdict: DocumentVerdict): DocumentOutcome {
  const traitConfig = state.ceo?.trait || 'analyst'
  const isGenerous = traitConfig === 'generous'
  const approveMultiplier = isGenerous ? 1.5 : 1.0

  if (verdict === 'approve') {
    switch (doc.nature) {
      case 'clear_good':
        return {
          moneyChange: -doc.details.amount,
          marketShareChange: doc.actualBenefit > 70 ? 0.3 : 0.1,
          brandPowerChange: doc.actualBenefit > 80 ? 1 : 0,
          ceoApprovalChange: randInt(CEO_BALANCE.approveGoodCeoBonus.min, CEO_BALANCE.approveGoodCeoBonus.max) * approveMultiplier,
          employeeMoraleChange: 5,
          description: `承認しました。${doc.details.expectedBenefit}`
        }
      case 'clear_bad':
        return {
          moneyChange: -(doc.actualAmount || doc.details.amount),
          marketShareChange: -0.2,
          brandPowerChange: -1,
          ceoApprovalChange: randInt(CEO_BALANCE.approveBadCeoPenalty.min, CEO_BALANCE.approveBadCeoPenalty.max),
          employeeMoraleChange: 0,
          description: `承認しました。しかし後に${TRAP_NAMES[doc.trap || ''] || '問題'}が発覚する可能性があります...`
        }
      case 'tradeoff':
        const tradeoffSuccess = Math.random() < 0.5
        return {
          moneyChange: -doc.details.amount,
          marketShareChange: tradeoffSuccess ? 0.2 : -0.1,
          brandPowerChange: 0,
          ceoApprovalChange: randInt(CEO_BALANCE.tradeoffCeoRange.min, CEO_BALANCE.tradeoffCeoRange.max),
          employeeMoraleChange: tradeoffSuccess ? 5 : -5,
          description: tradeoffSuccess ? '承認しました。施策は一定の成果を上げました。' : '承認しました。期待した効果は限定的でした。'
        }
      case 'gamble':
        const gambleSuccess = Math.random() * 100 < (doc.gambleSuccessRate || 50)
        return {
          moneyChange: gambleSuccess ? Math.floor(doc.details.amount * 0.5) : -doc.details.amount,
          marketShareChange: gambleSuccess ? 0.5 : -0.2,
          brandPowerChange: gambleSuccess ? 2 : -1,
          ceoApprovalChange: gambleSuccess ? 5 : -3,
          employeeMoraleChange: gambleSuccess ? 10 : -5,
          description: gambleSuccess ? '大成功！投資が大きなリターンをもたらしました！' : '残念ながら期待した結果は得られませんでした。'
        }
      case 'long_term':
        return {
          moneyChange: -doc.details.amount,
          marketShareChange: 0,
          brandPowerChange: 0,
          ceoApprovalChange: -1,
          employeeMoraleChange: 3,
          description: `承認しました。短期的にはコストですが、${doc.longTermTurns || 8}ターン後に効果が現れる見込みです。`
        }
    }
  }

  // 却下
  switch (doc.nature) {
    case 'clear_good':
      return {
        moneyChange: 0,
        marketShareChange: 0,
        brandPowerChange: 0,
        ceoApprovalChange: CEO_BALANCE.rejectGoodCeoPenalty,
        employeeMoraleChange: CEO_BALANCE.rejectGoodMoralePenalty,
        description: '却下しました。提出者のモチベーションが低下しました。'
      }
    case 'clear_bad':
      return {
        moneyChange: 0,
        marketShareChange: 0,
        brandPowerChange: 0,
        ceoApprovalChange: randInt(CEO_BALANCE.rejectBadCeoBonus.min, CEO_BALANCE.rejectBadCeoBonus.max),
        employeeMoraleChange: 0,
        description: `却下しました。${TRAP_NAMES[doc.trap || ''] || '不正'}を未然に防ぎました！`
      }
    case 'tradeoff':
      return {
        moneyChange: 0,
        marketShareChange: 0,
        brandPowerChange: 0,
        ceoApprovalChange: -1,
        employeeMoraleChange: -5,
        description: '却下しました。機会損失の可能性がありますが、リスクも回避しました。'
      }
    case 'gamble':
      return {
        moneyChange: 0,
        marketShareChange: 0,
        brandPowerChange: 0,
        ceoApprovalChange: CEO_BALANCE.gambleRejectPenalty,
        employeeMoraleChange: -3,
        description: '却下しました。安全策を取りました。'
      }
    case 'long_term':
      return {
        moneyChange: 0,
        marketShareChange: 0,
        brandPowerChange: 0,
        ceoApprovalChange: 0,
        employeeMoraleChange: -5,
        description: '却下しました。長期的な成長機会を見送りました。'
      }
  }

  return { moneyChange: 0, marketShareChange: 0, brandPowerChange: 0, ceoApprovalChange: 0, employeeMoraleChange: 0, description: '' }
}

function registerCausalChainEffects(state: any, doc: ApprovalDocument, verdict: DocumentVerdict) {
  for (const chain of CAUSAL_CHAINS) {
    if (chain.triggerCategory === doc.category && chain.triggerVerdict === verdict) {
      if (Math.random() < chain.probability) {
        // 後続イベントを予約（pendingCausalEffectsに格納）
        if (!state._pendingCausalEffects) state._pendingCausalEffects = []
        state._pendingCausalEffects.push({
          triggerTurn: state.turn + chain.delayTurns,
          resultCategory: chain.resultCategory,
          resultVisitorType: chain.resultVisitorType,
          sourceDocId: doc.id,
          description: chain.description
        })
      }
    }
  }
}

export function processExpiredDocuments(state: any): DocumentOutcome[] {
  const outcomes: DocumentOutcome[] = []
  const expired = state.documentQueue.filter((d: ApprovalDocument) =>
    d.deadline && d.deadline <= state.turn && d.verdict === null && !d.underInvestigation
  )

  for (const doc of expired) {
    const outcome: DocumentOutcome = {
      moneyChange: 0,
      marketShareChange: -0.1,
      brandPowerChange: 0,
      ceoApprovalChange: -3,
      employeeMoraleChange: -5,
      description: `「${doc.title}」が期限切れになりました。対応の遅れが組織の士気に影響しています。`
    }
    doc.verdict = 'hold'
    doc.resultApplied = true
    doc.outcome = outcome
    state.documentQueue = state.documentQueue.filter((d: ApprovalDocument) => d.id !== doc.id)
    state.documentHistory.push(doc)
    state.documentStats.totalProcessed++

    state.ceo.approvalRating = Math.max(0, state.ceo.approvalRating + outcome.ceoApprovalChange)
    outcomes.push(outcome)
  }
  return outcomes
}

export function processInvestigationResults(state: any): ApprovalDocument[] {
  const investigated = state.documentQueue.filter((d: ApprovalDocument) => d.underInvestigation && d.verdict === 'investigate')
  const completed: ApprovalDocument[] = []

  for (const doc of investigated) {
    doc.underInvestigation = false
    doc.verdict = null // 再度決裁可能に

    if (doc.nature === 'clear_bad') {
      doc.investigationResult = `調査の結果、${TRAP_NAMES[doc.trap || ''] || '問題'}の疑いが確認されました。金額に${Math.floor(((doc.actualAmount || 0) - doc.details.amount) / 10000)}万円の差異があります。`
      doc.clues.push({ field: '調査報告', observation: doc.investigationResult })
    } else if (doc.nature === 'gamble') {
      doc.investigationResult = `調査の結果、成功確率は約${doc.gambleSuccessRate}%と推定されます。${(doc.gambleSuccessRate || 50) > 50 ? '比較的有望な案件です。' : 'リスクが高い案件です。'}`
      doc.clues.push({ field: '調査報告', observation: doc.investigationResult })
    } else {
      doc.investigationResult = '調査の結果、特に問題は見つかりませんでした。書類の内容は概ね妥当です。'
      doc.clues.push({ field: '調査報告', observation: doc.investigationResult })
    }
    completed.push(doc)
  }
  return completed
}

export function processCausalChainEffects(state: any): { documents: ApprovalDocument[]; visitorTypes: string[] } {
  if (!state._pendingCausalEffects) return { documents: [], visitorTypes: [] }

  const triggered = state._pendingCausalEffects.filter((e: any) => e.triggerTurn <= state.turn)
  const docs: ApprovalDocument[] = []
  const visitorTypes: string[] = []

  for (const effect of triggered) {
    if (effect.resultCategory) {
      const doc = generateOneDocument(state, effect.resultCategory)
      doc.triggeredBy = effect.sourceDocId
      docs.push(doc)
    }
    if (effect.resultVisitorType) {
      visitorTypes.push(effect.resultVisitorType)
    }
  }

  state._pendingCausalEffects = state._pendingCausalEffects.filter((e: any) => e.triggerTurn > state.turn)
  return { documents: docs, visitorTypes }
}

export function processLongTermEffects(state: any): DocumentOutcome[] {
  const outcomes: DocumentOutcome[] = []
  for (const doc of state.documentHistory) {
    if (doc.nature === 'long_term' && doc.verdict === 'approve' && doc.longTermTurns && doc.longTermBenefit) {
      const effectTurn = doc.turnSubmitted + doc.longTermTurns
      if (effectTurn === state.turn) {
        const outcome: DocumentOutcome = {
          moneyChange: doc.longTermBenefit,
          marketShareChange: 0.5,
          brandPowerChange: 2,
          ceoApprovalChange: 5,
          employeeMoraleChange: 5,
          description: `過去の投資「${doc.title}」が実を結びました！+${Math.floor(doc.longTermBenefit / 10000)}万円`
        }
        state.money += outcome.moneyChange
        state.marketShare = Math.min(60, state.marketShare + outcome.marketShareChange)
        state.brandPower = Math.min(100, state.brandPower + outcome.brandPowerChange)
        state.ceo.approvalRating = Math.min(100, state.ceo.approvalRating + outcome.ceoApprovalChange)
        outcomes.push(outcome)
      }
    }
  }
  return outcomes
}

export function pruneHistory(state: any): void {
  if (state.documentHistory.length > CEO_BALANCE.maxDocumentHistory) {
    const excess = state.documentHistory.splice(0, state.documentHistory.length - CEO_BALANCE.maxDocumentHistory)
    for (const doc of excess) {
      if (doc.verdict === 'approve') state.documentStats.totalApproved++
      if (doc.verdict === 'reject') state.documentStats.totalRejected++
    }
  }
}
