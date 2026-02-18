// ビジネスエンパイア 2.0 - ゲーム状態管理
// game.ts:705-763 のクロージャ変数を集約

import type { GameState, Employee } from '../types'
import type { DifficultyLevel, CompetitorConfig } from '../gameConfig'
import { DEFAULT_COMPETITORS } from '../gameConfig'
import { PERSONALITIES, HIDDEN_TRAITS, generateTemperament } from '../config/personalities'
import { DEPARTMENTS, POSITIONS } from '../config/departments'

// ============================================
// デフォルトゲーム状態
// ============================================
const defaultGameState: GameState = {
    money: 10000000,
    employees: [],
    products: [],
    turn: 1,
    year: 2025,
    month: 1,
    week: 1,
    marketShare: 0.1,
    brandPower: 1,
    monthlyRevenue: 0,
    debt: 0,
    isBankrupt: false,
    revenueHistory: [],
    officeLevel: 1,
    difficulty: 'normal' as DifficultyLevel,
    competitorAttacks: [] as string[],
    lastNewsCategory: '' as string,
    unlockedAchievements: [] as string[],
    tutorialStep: 0,
    tutorialCompleted: false,
    wasLowMoney: false,
    totalProductSales: {} as Record<string, number>,
    // ======= 社長モード =======
    gameMode: 'management' as 'management' | 'ceo',
    ceo: null as any,
    documentQueue: [] as any[],
    documentHistory: [] as any[],
    documentStats: {
        totalProcessed: 0,
        totalApproved: 0,
        totalRejected: 0,
        trapsDetected: 0,
        trapsMissed: 0
    },
    currentVisitor: null as any,
    visitorHistory: [] as any[],
    pendingDirectives: [] as string[],
    companyCulture: 50,
    scandalRisk: 0,
    isGameOver: false,
    gameOverReason: null as string | null,
    _pendingCausalEffects: [] as any[]
}

// ============================================
// ゲーム状態（シングルトン）
// ============================================
const game: GameState = cloneDefaults()

// ============================================
// パネル・スロット状態
// ============================================
let activePanel = 'overview'
let currentSlotId = 1

// ============================================
// 競合企業（動的状態）
// ============================================
const competitors: CompetitorConfig[] = JSON.parse(JSON.stringify(DEFAULT_COMPETITORS))
competitors.forEach(c => {
    c.share = c.initialShare
})

// ============================================
// アクセサ関数
// ============================================

export function getGame(): GameState {
    return game
}

export function getActivePanel(): string {
    return activePanel
}

export function setActivePanel(panel: string): void {
    activePanel = panel
}

export function getCurrentSlotId(): number {
    return currentSlotId
}

export function setCurrentSlotId(slotId: number): void {
    currentSlotId = slotId
}

export function getCompetitors(): CompetitorConfig[] {
    return competitors
}

export function resetCompetitors(): void {
    const defaultComps = JSON.parse(JSON.stringify(DEFAULT_COMPETITORS)) as CompetitorConfig[]
    competitors.length = 0
    defaultComps.forEach((c: CompetitorConfig) => {
        c.share = c.initialShare
        competitors.push(c)
    })
}

// ============================================
// 状態操作関数
// ============================================

export function cloneDefaults(): GameState {
    return JSON.parse(JSON.stringify(defaultGameState))
}

export function overwriteGameState(source: any): void {
    Object.keys(game).forEach(key => delete (game as any)[key])
    Object.assign(game, source)
}

export function ensureCollections(): void {
    if (!Array.isArray(game.employees)) game.employees = []
    if (!Array.isArray(game.products)) game.products = []
    if (!Array.isArray(game.revenueHistory)) game.revenueHistory = []
}

export function normalizeGameState(): void {
    ensureCollections()
    game.money = Number(game.money) || 0
    game.turn = Number(game.turn) || 1
    game.year = Number(game.year) || 2025
    game.month = Number(game.month) || 1
    game.week = Number(game.week) || 1
    game.marketShare = Number(game.marketShare) || 0
    game.brandPower = Number(game.brandPower) || 0
    game.monthlyRevenue = Number(game.monthlyRevenue) || 0
    game.debt = Math.max(0, Number(game.debt) || 0)
    game.isBankrupt = Boolean(game.isBankrupt)
    game.officeLevel = Math.max(1, Math.min(5, Number(game.officeLevel) || 1))
    game.employees.forEach((emp: any) => {
        emp.salary = Number(emp.salary) || 0
        if (typeof emp.abilities !== 'object' || emp.abilities === null) {
            emp.abilities = { technical: 0, sales: 0, planning: 0, management: 0 }
        }
        Object.keys(emp.abilities).forEach(key => {
            emp.abilities[key] = Number(emp.abilities[key]) || 0
        })
        if (!emp.personalityKey || !PERSONALITIES[emp.personalityKey]) {
            emp.personalityKey = 'logical'
        }
        if (!Array.isArray(emp.subTraits)) {
            emp.subTraits = []
        }
        if (!emp.hiddenTrait || !HIDDEN_TRAITS[emp.hiddenTrait]) {
            const hiddenKeys = Object.keys(HIDDEN_TRAITS)
            emp.hiddenTrait = hiddenKeys[Math.floor(Math.random() * hiddenKeys.length)]
        }
        if (typeof emp.hiddenTraitRevealed !== 'boolean') {
            emp.hiddenTraitRevealed = false
        }
        if (typeof emp.joinedTurn !== 'number') {
            emp.joinedTurn = game.turn || 1
        }
        if (!Array.isArray(emp.growthHistory)) {
            emp.growthHistory = [
                { turn: emp.joinedTurn, event: '入社', description: '会社に参加しました' }
            ]
        }
        if (!emp.department || !DEPARTMENTS[emp.department]) {
            emp.department = 'development'
        }
        if (!emp.position || !POSITIONS[emp.position]) {
            emp.position = 'staff'
        }
        if (typeof emp.skillPoints !== 'number') {
            emp.skillPoints = 0
        }
        if (!Array.isArray(emp.unlockedSkills)) {
            emp.unlockedSkills = []
        }
        if (!emp.temperament || typeof emp.temperament !== 'object') {
            emp.temperament = generateTemperament(emp.personalityKey)
        }
        if (typeof emp.qualification !== 'string' && emp.qualification !== null) {
            emp.qualification = null
        }
    })
    game.products.forEach((product: any) => {
        product.sales = Number(product.sales) || 0
        product.quality = Number(product.quality) || 0
    })
    // ======= 社長モード フィールドの正規化 =======
    if (!game.gameMode) game.gameMode = 'management'
    if (!Array.isArray(game.documentQueue)) game.documentQueue = []
    if (!Array.isArray(game.documentHistory)) game.documentHistory = []
    if (!game.documentStats) game.documentStats = { totalProcessed: 0, totalApproved: 0, totalRejected: 0, trapsDetected: 0, trapsMissed: 0 }
    if (!Array.isArray(game.visitorHistory)) game.visitorHistory = []
    if (!Array.isArray(game.pendingDirectives)) game.pendingDirectives = []
    if (typeof game.companyCulture !== 'number') game.companyCulture = 50
    if (typeof game.scandalRisk !== 'number') game.scandalRisk = 0
    if (typeof game.isGameOver !== 'boolean') game.isGameOver = false
    if (!Array.isArray(game._pendingCausalEffects)) game._pendingCausalEffects = []
}

export function resetGameState(): void {
    overwriteGameState(cloneDefaults())
    normalizeGameState()
    activePanel = 'overview'
}
