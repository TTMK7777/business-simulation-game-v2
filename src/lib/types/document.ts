// 社長モード: 決裁書類の型定義

export type DocumentCategory =
  | 'hiring' | 'budget' | 'product_plan' | 'marketing'
  | 'equipment' | 'personnel_change' | 'promotion' | 'training'
  | 'salary_raise' | 'new_business' | 'cost_cut' | 'partnership'

export type DocumentPriority = 'urgent' | 'high' | 'normal' | 'low'

export type TrapType =
  | 'inflated_cost' | 'embezzlement' | 'incompetent_hire'
  | 'wasteful_spending' | 'hidden_risk' | 'conflict_interest'
  | 'fake_data' | null

export type DocumentNature =
  | 'clear_good'   // 明確に良い提案（承認が正解）
  | 'clear_bad'    // 罠・不正（却下が正解）
  | 'tradeoff'     // トレードオフ型（正解がない、状況次第）
  | 'gamble'       // ハイリスク・ハイリターン（成功確率付き）
  | 'long_term'    // 短期損失だが長期利益

export type DocumentVerdict = 'approve' | 'reject' | 'hold' | 'remand' | 'investigate'

export interface DocumentClue {
  field: string        // 「予算内訳」「担当者実績」等
  observation: string  // 事実のみ: 「研修費が業界平均の1.8倍」
}

export interface DocumentOutcome {
  moneyChange: number
  marketShareChange: number
  brandPowerChange: number
  ceoApprovalChange: number
  employeeMoraleChange: number
  description: string
}

export interface ApprovalDocument {
  id: string
  category: DocumentCategory
  priority: DocumentPriority
  title: string
  department: string
  submitter: {
    employeeId: number | null
    name: string
    position: string
  }
  summary: string
  details: {
    amount: number
    expectedBenefit: string
    timeline: string
    risks: string
    attachments: string[]
  }
  // 書類の真の性質（プレイヤーには見えない）
  nature: DocumentNature
  trap: TrapType
  clues: DocumentClue[]
  actualAmount?: number
  actualBenefit: number       // 0-100
  gambleSuccessRate?: number  // nature==='gamble'時の成功確率 0-100
  longTermBenefit?: number    // nature==='long_term'時の長期効果値
  longTermTurns?: number      // 効果発現までのターン数
  // 因果関係チェーン
  triggeredBy?: string
  canTrigger?: string[]
  // ゲームメカニクス
  turnSubmitted: number
  deadline: number | null
  verdict: DocumentVerdict | null
  resultApplied: boolean
  // 調査中の状態
  underInvestigation: boolean
  investigationResult?: string
  outcome?: DocumentOutcome
}

// 書類テンプレート（config用）
export interface DocumentTemplate {
  category: DocumentCategory
  titleTemplate: string
  summaryTemplate: string
  benefitTemplate: string
  risksTemplate: string
  baseAmount: { min: number; max: number }
  baseBenefit: { min: number; max: number }
  priority: DocumentPriority
  possibleNatures: DocumentNature[]
  possibleTraps: TrapType[]
  clueTemplates: { field: string; observation: string }[]
  // 因果チェーン
  triggerCategories?: DocumentCategory[]
  triggerVisitorTypes?: string[]
}

// 状況修飾子（config用）
export interface SituationModifier {
  condition: (state: any) => boolean
  label: string
  amountMultiplier: number
  benefitMultiplier: number
  extraClue?: { field: string; observation: string }
}
