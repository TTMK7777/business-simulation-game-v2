// 社長モード: CEO支持率・株価・ゲームオーバー判定
import type { CEOStatus, PolicyFocus, QuarterlyReview } from '../types/index'
import { CEO_BALANCE, CEO_TRAITS, POLICY_FOCUSES } from '../config/ceo'

export function updateApprovalRating(state: any): void {
  if (!state.ceo) return

  const trait = state.ceo.trait
  const decay = trait === 'charismatic'
    ? CEO_BALANCE.charismaticDecay
    : CEO_BALANCE.approvalDecayPerTurn

  state.ceo.approvalRating = Math.max(0, Math.min(100, state.ceo.approvalRating + decay))

  // 社風の自然減衰
  state.companyCulture = Math.max(0, Math.min(100, (state.companyCulture || 50) + CEO_BALANCE.companyCultureDecay))

  // スキャンダルリスクの自然減衰
  state.scandalRisk = Math.max(0, (state.scandalRisk || 0) + CEO_BALANCE.scandalRiskDecay)

  // 低支持率の連続カウント
  if (state.ceo.approvalRating < CEO_BALANCE.lowApprovalThreshold) {
    state.ceo.consecutiveLowApproval++
  } else {
    state.ceo.consecutiveLowApproval = 0
  }
}

export function calculateStockPrice(state: any): number {
  if (!state.ceo) return 1000

  const base = CEO_BALANCE.stockPriceBase
  const shareMultiplier = 1 + (state.marketShare || 0) / 100
  const brandMultiplier = 1 + (state.brandPower || 0) / 100
  const approvalMultiplier = state.ceo.approvalRating / 50

  let price = Math.floor(base * shareMultiplier * brandMultiplier * approvalMultiplier)

  // 月次変動
  const variance = (Math.random() * 2 - 1) * CEO_BALANCE.stockPriceMonthlyVariance
  price = Math.floor(price * (1 + variance))

  state.ceo.stockPrice = Math.max(100, price)
  return state.ceo.stockPrice
}

export function generateQuarterlyReview(state: any): QuarterlyReview | null {
  if (!state.ceo) return null

  // 四半期の業績を集計
  const revenue = state.monthlyRevenue * 3
  const salaryTotal = (state.employees || []).reduce((sum: number, e: any) => sum + (e.salary || 0), 0) * 3
  const profit = revenue - salaryTotal
  const employeeSatisfaction = (state.employees || []).length > 0
    ? Math.floor((state.employees || []).reduce((sum: number, e: any) => sum + (e.motivation || 50), 0) / state.employees.length)
    : 50

  // 方針整合度の計算
  let policyAlignment = 50
  if (state.ceo.currentPolicy) {
    const focuses = state.ceo.currentPolicy.focus
    const alignedCategories = focuses.flatMap((f: PolicyFocus) => POLICY_FOCUSES[f]?.alignmentCategories || [])
    const recentDocs = state.documentHistory.filter((d: any) =>
      d.turnSubmitted > state.turn - 12 && d.verdict === 'approve'
    )
    if (recentDocs.length > 0) {
      const alignedCount = recentDocs.filter((d: any) => alignedCategories.includes(d.category)).length
      policyAlignment = Math.floor((alignedCount / recentDocs.length) * 100)
    }
  }

  // 総合スコア
  const score = Math.floor(
    (profit > 0 ? 30 : 0) +
    (employeeSatisfaction / 100 * 30) +
    (policyAlignment / 100 * 20) +
    (state.ceo.approvalRating / 100 * 20)
  )

  // グレード
  let grade: QuarterlyReview['grade'] = 'F'
  let ceoBonus = CEO_BALANCE.quarterlyGrades[CEO_BALANCE.quarterlyGrades.length - 1].ceoBonus
  for (const g of CEO_BALANCE.quarterlyGrades) {
    if (score >= g.min) {
      grade = g.grade
      ceoBonus = g.ceoBonus
      break
    }
  }

  // CEO支持率にボーナス/ペナルティ
  state.ceo.approvalRating = Math.max(0, Math.min(100, state.ceo.approvalRating + ceoBonus))

  const review: QuarterlyReview = {
    revenue,
    profit,
    employeeSatisfaction,
    policyAlignment,
    grade
  }

  state.ceo.quarterlyReview = review
  return review
}

export function setPolicy(state: any, focuses: PolicyFocus[]): void {
  if (!state.ceo) return
  state.ceo.currentPolicy = {
    focus: focuses.slice(0, 3),
    setAtTurn: state.turn
  }
}

export function issueDirective(state: any, department: string, type: string): void {
  if (!state.pendingDirectives) state.pendingDirectives = []
  state.pendingDirectives.push(`${department}:${type}`)
}

export function checkGameOver(state: any): string | null {
  if (!state.ceo) return null

  // 支持率が低すぎて3ターン連続
  if (state.ceo.consecutiveLowApproval >= CEO_BALANCE.gameOverConsecutiveTurns) {
    return '取締役会により社長を解任されました。支持率の回復に失敗しました。'
  }

  // 倒産（既存の判定と統合）
  if (state.money < 0) {
    return '経営破綻しました。資金が枯渇しました。'
  }

  return null
}

export function resetWeeklyLimits(state: any): void {
  if (!state.ceo) return
  state.ceo.remandsThisWeek = 0
}

// 四半期の開始判定
export function isQuarterStart(state: any): boolean {
  return (state.month % 3 === 1) && state.week === 1
}

// 方針が書類カテゴリと整合するかチェック
export function checkPolicyAlignment(state: any, category: string): number {
  if (!state.ceo?.currentPolicy) return 0

  const focuses = state.ceo.currentPolicy.focus
  for (const focus of focuses) {
    const config = POLICY_FOCUSES[focus]
    if (config && config.alignmentCategories.includes(category)) {
      return CEO_BALANCE.policyAlignmentBonus
    }
  }

  // 方針と矛盾する判断の場合
  // (例: コスト削減方針なのに大型投資を承認)
  const contradictions: Record<string, string[]> = {
    cost_reduction: ['equipment', 'new_business', 'salary_raise'],
    aggressive_hiring: ['cost_cut'],
    employee_welfare: ['cost_cut']
  }

  for (const focus of focuses) {
    if (contradictions[focus]?.includes(category)) {
      return CEO_BALANCE.policyMismatchPenalty
    }
  }

  return 0
}
