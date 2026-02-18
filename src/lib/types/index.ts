// ビジネスエンパイア 2.0 - 型定義
// game.ts から抽出した全型定義

import type { DifficultyLevel, Achievement, AchievementRarity, CompetitorConfig, TutorialStep } from '../gameConfig'

// Re-export gameConfig types for convenience
export type { DifficultyLevel, Achievement, AchievementRarity, CompetitorConfig, TutorialStep }

// Re-export qualification types
export type { Qualification } from '../types.d'

// ============================================
// 能力値
// ============================================
export interface Abilities {
    technical: number
    sales: number
    planning: number
    management: number
}

// ============================================
// 気質パラメータ
// ============================================
export interface Temperament {
    boldness: number
    bravery: number
    cooperation: number
    creativity: number
    conscientiousness: number
    emotionalStability: number
    sociability: number
    cautiousness: number
}

// ============================================
// 成長履歴イベント
// ============================================
export interface GrowthEvent {
    turn: number
    event: string
    description: string
}

// ============================================
// 従業員
// ============================================
export interface Employee {
    id: number
    name: string
    age?: number
    personalityKey: string
    abilities: Abilities
    temperament: Temperament
    subTraits: string[]
    hiddenTrait: string
    hiddenTraitRevealed: boolean
    joinedTurn: number
    motivation: number
    salary: number
    department: string
    position: string
    qualification: string | null
    skillPoints: number
    unlockedSkills: string[]
    growthHistory: GrowthEvent[]
    jobType?: string
    stress?: number
}

// ============================================
// 製品
// ============================================
export interface Product {
    id: number
    name: string
    quality: number
    sales: number
    assignedEmployees?: (number | Employee)[]
}

// ============================================
// ゲーム状態
// ============================================
export interface GameState {
    money: number
    employees: Employee[]
    products: Product[]
    turn: number
    year: number
    month: number
    week: number
    marketShare: number
    brandPower: number
    monthlyRevenue: number
    debt: number
    isBankrupt: boolean
    revenueHistory: number[]
    officeLevel: number
    difficulty: DifficultyLevel
    competitorAttacks: string[]
    lastNewsCategory: string
    unlockedAchievements: string[]
    tutorialStep: number
    tutorialCompleted: boolean
    wasLowMoney: boolean
    totalProductSales: Record<string, number>
    companyName?: string
    activePanel?: string
    // ======= 社長モード =======
    gameMode: 'management' | 'ceo'
    ceo: import('./ceo').CEOStatus | null
    documentQueue: import('./document').ApprovalDocument[]
    documentHistory: import('./document').ApprovalDocument[]
    documentStats: {
        totalProcessed: number
        totalApproved: number
        totalRejected: number
        trapsDetected: number
        trapsMissed: number
    }
    currentVisitor: import('./visitor').VisitorEvent | null
    visitorHistory: import('./visitor').VisitorEvent[]
    pendingDirectives: string[]
    companyCulture: number
    scandalRisk: number
    isGameOver: boolean
    gameOverReason: string | null
    _pendingCausalEffects: any[]
}

// ============================================
// Manager 結果型
// ============================================
export interface HireResult {
    success: boolean
    message?: string
    employee?: Employee
}

export interface PromotionResult {
    success: boolean
    message?: string
    employee?: Employee
    oldPosition?: string
    newPosition?: string
    bonusPoints?: number
}

export interface DepartmentChangeResult {
    success: boolean
    message?: string
    employee?: Employee
    oldDepartment?: string
    newDepartment?: string
}

export interface SkillUnlockResult {
    success: boolean
    message?: string
    employee?: Employee
    skill?: any
    specialEffect?: any
}

export interface TrainingResult {
    success: boolean
    message?: string
    cost?: number
    growthDetails: { name: string; growth: number }[]
    bonusMessages: string[]
    focusType?: string
}

export interface MarketingResult {
    success: boolean
    message?: string
    strategy?: string
    shareChange?: number
    brandChange?: number
}

// ============================================
// 性格定義型
// ============================================
export interface PersonalityDef {
    name: string
    emoji: string
    effects: Record<string, number>
    compatible: string[]
    incompatible: string[]
    description?: string
}

export interface SubTraitDef {
    name: string
    emoji: string
    effect: string
    negative?: boolean
    impact?: Record<string, number>
}

export interface TemperamentTraitDef {
    name: string
    emoji: string
    description: string
    effects: string
}

export interface HiddenTraitDef {
    name: string
    emoji: string
    effect: string
    revealTurn: number
    negative?: boolean
}

// ============================================
// 部署・役職型
// ============================================
export interface DepartmentDef {
    name: string
    emoji: string
    primaryAbility: string
    salaryMultiplier: number
    description: string
    abilityWeights: Record<string, { min: number; max: number }>
    temperamentWeights?: Record<string, number>
}

export interface PositionDef {
    name: string
    emoji: string
    salaryMultiplier: number
    requiredAbility: number
    managementBonus: number
    description: string
    canManage?: number
}

// ============================================
// スキルツリー型
// ============================================
export interface SkillDef {
    name: string
    description: string
    cost: number
    effect: Record<string, number>
    prerequisites: string[]
    tier: number
    icon: string
    special?: string
}

export interface SkillCategoryDef {
    name: string
    emoji: string
    color: string
    skills: Record<string, SkillDef>
}

export interface SkillEffectDef {
    description: string
    value: number
}

// ============================================
// オフィスレベル型
// ============================================
export interface OfficeLevelDef {
    name: string
    emoji: string
    maxEmployees: number
    description: string
    unlockConditions: {
        employees: number
        money: number
        marketShare: number
    }
}

// ============================================
// 社長モード: 型の再エクスポート
// ============================================
export type {
  DocumentCategory, DocumentPriority, TrapType,
  DocumentNature, DocumentVerdict, DocumentClue,
  DocumentOutcome, ApprovalDocument,
  DocumentTemplate, SituationModifier
} from './document'

export type {
  VisitorType, VisitorMood,
  VisitorResponse, VisitorEvent,
  VisitorTemplate
} from './visitor'

export type {
  CEOTrait, PolicyFocus, QuarterlyReview, CEOStatus,
  CEOTraitConfig, PolicyFocusConfig
} from './ceo'
