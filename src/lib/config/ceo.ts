// 社長モード: CEO特性・経営方針の設定定義
import type { CEOTraitConfig, PolicyFocusConfig, CEOTrait, PolicyFocus, CEOStatus } from '../types/index'

export const CEO_TRAITS: Record<CEOTrait, CEOTraitConfig> = {
  visionary: {
    name: '先見の明',
    emoji: '🔮',
    description: '市場の変化を敏感に察知。long_term書類のヒントが多く表示される',
    effects: { clueBonus: 'long_term' }
  },
  people_person: {
    name: '人たらし',
    emoji: '🤝',
    description: '人心掌握に長ける。訪問者対応の効果が+50%',
    effects: { visitorBonus: 1.5 }
  },
  analyst: {
    name: '分析家',
    emoji: '📊',
    description: '数字に強い。数値不整合の観察ポイントが追加される',
    effects: { clueBonus: 'numbers' }
  },
  charismatic: {
    name: 'カリスマ',
    emoji: '🌟',
    description: '圧倒的なカリスマ性。支持率の自然減衰が-0.1に軽減',
    effects: { approvalDecay: -0.1 }
  },
  strict: {
    name: '厳格',
    emoji: '⚔️',
    description: '規律を重んじる。罠の発見率+20%、ただし却下時のモチベ影響が大きい',
    effects: { trapDetectionBonus: 0.2, moraleImpact: 1.5 }
  },
  generous: {
    name: '寛大',
    emoji: '🎁',
    description: '部下に寛容。承認時のボーナスが大きいが、罠の発見が難しい',
    effects: { approveBonus: 1.5, trapDetectionBonus: -0.1 }
  }
}

export const POLICY_FOCUSES: Record<PolicyFocus, PolicyFocusConfig> = {
  aggressive_hiring: {
    name: '積極採用',
    emoji: '👥',
    description: '人材を積極的に確保し、組織を拡大する',
    documentWeights: { hiring: 2.0, training: 1.5 },
    alignmentCategories: ['hiring', 'training']
  },
  cost_reduction: {
    name: 'コスト削減',
    emoji: '✂️',
    description: '無駄を排除し、利益率を高める',
    documentWeights: { cost_cut: 2.0, budget: 0.7 },
    alignmentCategories: ['cost_cut']
  },
  new_product: {
    name: '新製品開発',
    emoji: '🚀',
    description: '新製品を開発し、競争力を強化する',
    documentWeights: { product_plan: 2.0, equipment: 1.3 },
    alignmentCategories: ['product_plan']
  },
  market_expansion: {
    name: '市場拡大',
    emoji: '🌍',
    description: '市場シェアの拡大を目指す',
    documentWeights: { marketing: 2.0, new_business: 1.5 },
    alignmentCategories: ['marketing', 'new_business']
  },
  employee_welfare: {
    name: '従業員福利',
    emoji: '❤️',
    description: '従業員の満足度と定着率を高める',
    documentWeights: { salary_raise: 1.5, training: 1.5, equipment: 1.3 },
    alignmentCategories: ['salary_raise', 'training']
  },
  tech_innovation: {
    name: '技術革新',
    emoji: '💡',
    description: '最新技術への投資と革新を推進する',
    documentWeights: { equipment: 2.0, product_plan: 1.5, training: 1.3 },
    alignmentCategories: ['equipment', 'product_plan']
  },
  quality_improvement: {
    name: '品質向上',
    emoji: '🏆',
    description: '製品・サービスの品質を最優先にする',
    documentWeights: { product_plan: 1.5, training: 1.5 },
    alignmentCategories: ['product_plan', 'training']
  },
  partnership: {
    name: '外部提携',
    emoji: '🤝',
    description: '外部企業との提携で事業を拡大する',
    documentWeights: { partnership: 2.5 },
    alignmentCategories: ['partnership']
  }
}

// デフォルトのCEOStatus
export function createDefaultCEOStatus(trait: CEOTrait): CEOStatus {
  return {
    approvalRating: 60,
    stockPrice: 1000,
    decisionsCorrect: 0,
    decisionsWrong: 0,
    trapsDetected: 0,
    trapsMissed: 0,
    trait,
    consecutiveLowApproval: 0,
    remandsThisWeek: 0,
    investigationBudget: 0,
    currentPolicy: null,
    quarterlyReview: null,
    gamblesRejected: 0
  }
}

// CEOモード用バランス定数
export const CEO_BALANCE = {
  // 支持率関連
  approvalDecayPerTurn: -0.3,
  charismaticDecay: -0.1,
  lowApprovalThreshold: 10,
  gameOverConsecutiveTurns: 3,

  // 書類生成
  baseDocumentsPerTurn: 2,
  documentsPerTurnGrowth: 20,    // turn/20 の追加
  documentsPerEmployeeGrowth: 10, // employees.length/10 の追加
  maxDocumentsPerTurn: 6,
  trapBaseRate: { easy: 0.10, normal: 0.15, hard: 0.25 },
  trapGrowthPerTurn: 0.002,
  maxTrapRate: 0.35,

  // nature分布
  natureDistribution: {
    clear_good: 0.30,
    clear_bad: 0.15,  // 難易度で上書き
    tradeoff: 0.25,
    gamble: 0.15,
    long_term: 0.15
  },

  // 決裁結果
  approveGoodCeoBonus: { min: 2, max: 3 },
  rejectGoodCeoPenalty: -2,
  rejectGoodMoralePenalty: -15,
  approveBadCeoPenalty: { min: -5, max: -15 },
  rejectBadCeoBonus: { min: 5, max: 10 },
  tradeoffCeoRange: { min: -1, max: 2 },
  gambleRejectPenalty: 0, // gamblesRejectedで蓄積
  longTermImmediateLoss: 0.5, // amountの50%が即座に損失

  // 差し戻し
  maxRemandsPerWeek: 1,
  remandMoralePenalty: -3,
  remandCeoPenalty: -1,

  // 調査
  investigationCost: 50000,
  investigationDeadlineExtension: 1,

  // 訪問者
  visitorBaseChance: 0.30,

  // 株価計算
  stockPriceBase: 1000,
  stockPriceMonthlyVariance: 0.05,

  // 履歴制限
  maxDocumentHistory: 50,
  maxVisitorHistory: 20,

  // 方針整合
  policyAlignmentBonus: 1.5,
  policyMismatchPenalty: -1,

  // 四半期グレード
  quarterlyGrades: [
    { min: 90, grade: 'S' as const, ceoBonus: 10 },
    { min: 75, grade: 'A' as const, ceoBonus: 5 },
    { min: 60, grade: 'B' as const, ceoBonus: 2 },
    { min: 40, grade: 'C' as const, ceoBonus: 0 },
    { min: 20, grade: 'D' as const, ceoBonus: -5 },
    { min: 0, grade: 'F' as const, ceoBonus: -10 }
  ],

  // 社風
  companyCultureDecay: -0.1,
  scandalRiskDecay: -0.5
}
