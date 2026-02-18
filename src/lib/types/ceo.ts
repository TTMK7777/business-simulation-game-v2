// 社長モード: CEO評価の型定義

export type CEOTrait =
  | 'visionary'     // 先見の明: ヒントが見やすい
  | 'people_person' // 人たらし: 訪問者対応ボーナス
  | 'analyst'       // 分析家: 数字不整合を発見しやすい
  | 'charismatic'   // カリスマ: 支持率の自然回復+1
  | 'strict'        // 厳格: 罠発見+, モチベ影響大
  | 'generous'      // 寛大: 承認ボーナス大, 罠発見-

export type PolicyFocus =
  | 'aggressive_hiring'    // 積極採用
  | 'cost_reduction'       // コスト削減
  | 'new_product'          // 新製品開発
  | 'market_expansion'     // 市場拡大
  | 'employee_welfare'     // 従業員福利
  | 'tech_innovation'      // 技術革新
  | 'quality_improvement'  // 品質向上
  | 'partnership'          // 外部提携

export interface QuarterlyReview {
  revenue: number
  profit: number
  employeeSatisfaction: number
  policyAlignment: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface CEOStatus {
  approvalRating: number       // 0-100 支持率
  stockPrice: number
  decisionsCorrect: number
  decisionsWrong: number
  trapsDetected: number
  trapsMissed: number
  trait: CEOTrait
  consecutiveLowApproval: number
  remandsThisWeek: number
  investigationBudget: number
  // 経営方針
  currentPolicy: {
    focus: PolicyFocus[]
    setAtTurn: number
  } | null
  quarterlyReview: QuarterlyReview | null
  // gamble却下の蓄積（「挑戦しない社長」評価）
  gamblesRejected: number
}

// CEO特性定義（config用）
export interface CEOTraitConfig {
  name: string
  emoji: string
  description: string
  effects: {
    clueBonus?: string
    approvalDecay?: number
    visitorBonus?: number
    trapDetectionBonus?: number
    approveBonus?: number
    moraleImpact?: number
  }
}

// 経営方針定義（config用）
export interface PolicyFocusConfig {
  name: string
  emoji: string
  description: string
  documentWeights: Record<string, number>
  alignmentCategories: string[]
}
