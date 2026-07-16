// ビジネスエンパイア 2.0 - ゲームオーケストレーター
// game.ts:813-862, 1402-1528, 1567-1637, 3808-4018 から抽出

import {
    getGame,
    getActivePanel,
    setActivePanel,
    getCurrentSlotId,
    setCurrentSlotId,
    getCompetitors,
    resetCompetitors,
    cloneDefaults,
    overwriteGameState,
    ensureCollections,
    normalizeGameState,
    resetGameState
} from '../store/gameStore'
import { HIDDEN_TRAITS, generateTemperament } from '../config/personalities'
import { OFFICE_LEVELS } from '../config/offices'
import {
    DIFFICULTY_SETTINGS,
    type DifficultyLevel
} from '../gameConfig'
import { loadSlotData, saveSlotData, type SaveMetadata } from '../storage'
import { characterManager, initCharacterRenderer, type AnimationState, type JobType } from '../cssCharacterManager'

// ======= 社長モード =======
import * as DocumentManager from './DocumentManager'
import * as VisitorManager from './VisitorManager'
import * as CEOManager from './CEOManager'
import * as FinanceManager from './FinanceManager'
import { updateMonthlyStress } from './HRManager'
import { renderQuarterlyReview, renderPolicySelection } from '../ui/ceoStatus'
import { renderVisitorDialog } from '../ui/visitorDialog'
import { applyTabVisibilityForMode } from '../ui/renderers'
import { escapeHtml } from '../ui/escape'

// ======= a2ui 配線 (Phase 1 見える化スプリント C) =======
import { getA2UIManager } from '../a2ui/manager'
import {
    pickMonthlyNews,
    isFinanceDanger,
    shouldFireDangerAdvisor,
    buildDangerAdvisorMessage,
    buildFinanceSummaryData,
    type GeneratedNews,
    type CompetitorAttackLike,
} from '../a2ui/eventMapping'

// ============================================
// 定数
// ============================================

// 資金危険水域アドバイザーの「新規突入時のみ発火」判定用 (セッション内で保持。
// リロード直後は常に false 始まりのため、既に危険水域のセーブをロードした場合は
// 次の月次到達時に1回だけ再度アドバイザーが出る)
let _wasFinanceDanger = false

// ============================================
// R-1: window 関数呼び出しヘルパー
// 起動シーケンスなど critical な箇所で silent fail を防ぐ
// ============================================
function invokeWindowCritical(fnName: string, ...args: any[]): void {
    const fn = (window as any)[fnName]
    if (typeof fn === 'function') {
        fn(...args)
    } else {
        console.warn(`[GameManager] critical: window.${fnName} is not bound. Initialization may be incomplete.`)
    }
}

// ============================================
// オフィスレベル判定
// ============================================

export function determineOfficeLevel(): number {
    const game = getGame()
    const currentEmployees = game.employees.length
    const currentMoney = game.money
    const currentMarketShare = game.marketShare

    for (let level = 5; level >= 1; level--) {
        const conditions = OFFICE_LEVELS[level].unlockConditions
        if (currentEmployees >= conditions.employees &&
            currentMoney >= conditions.money &&
            currentMarketShare >= conditions.marketShare) {
            return level
        }
    }
    return 1
}

// オフィスアップグレードチェック（ターン終了時に呼ばれる）
export function checkOfficeUpgrade(): boolean {
    const game = getGame()
    const newLevel = determineOfficeLevel()
    if (newLevel > game.officeLevel) {
        const oldOffice = OFFICE_LEVELS[game.officeLevel]
        const newOffice = OFFICE_LEVELS[newLevel]
        game.officeLevel = newLevel

        // TODO: 接続 - showModal は game.ts から直接呼び出し中
        setTimeout(() => {
            (window as any).showModal(
                '🎉 オフィスアップグレード！',
                `<div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">
                        ${oldOffice.emoji} → ${newOffice.emoji}
                    </div>
                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #667eea;">
                        ${newOffice.name}
                    </div>
                    <div style="color: #666; margin-bottom: 20px;">
                        ${newOffice.description}
                    </div>
                    <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">📊 新しい上限</div>
                        <div>最大従業員数: <strong>${newOffice.maxEmployees}名</strong></div>
                    </div>
                </div>`
            )
        }, 800)
        return true
    }
    return false
}

// ============================================
// 初期従業員追加
// ============================================

export function addInitialEmployee(): void {
    const game = getGame()
    ensureCollections()
    if (game.employees.length > 0) return
    const initialEmployee = {
        id: 1,
        name: '山田 太郎',
        personalityKey: 'logical',
        abilities: { technical: 65, sales: 45, planning: 55, management: 50 },
        temperament: generateTemperament('logical'),
        subTraits: ['fast_learner', 'code_reviewer'],
        hiddenTrait: 'late_bloomer',
        hiddenTraitRevealed: false,
        joinedTurn: 1,
        motivation: 75,
        salary: 400000,
        department: 'development',
        position: 'staff',
        qualification: null as string | null,
        skillPoints: 0,
        unlockedSkills: [],
        growthHistory: [
            { turn: 1, event: '入社', description: '会社に参加しました' }
        ]
    }
    game.employees.push(initialEmployee)
}

// レガシー SAVE_KEY ('businessEmpire') 経路の loadGameFromStorage / init は削除済み。
// 起動は main.ts → initWithSlot のみで、旧キーへの書き込み箇所は存在しなかった (到達不能パス)

// ============================================
// スロット指定初期化
// ============================================

export async function initWithSlot(slotId: number, difficulty?: DifficultyLevel): Promise<void> {
    const game = getGame()
    const competitors = getCompetitors()
    setCurrentSlotId(slotId)
    console.log(`📂 スロット ${slotId} から初期化中... (難易度: ${difficulty || 'ロードデータから'})`)

    const slotData = await loadSlotData(slotId)

    if (slotData) {
        console.log(`✅ スロット ${slotId} からロードしました`)
        const merged = Object.assign(cloneDefaults(), slotData)
        overwriteGameState(merged)
        normalizeGameState()
        const panel = typeof slotData.activePanel === 'string' ? slotData.activePanel : 'overview'
        setActivePanel(panel)
        delete (game as any).activePanel

        if (game.employees.length === 0) {
            addInitialEmployee()
        }

        // ======= 社長モード: ロード時のUI設定 =======
        if (game.gameMode === 'ceo') {
            applyTabVisibilityForMode('ceo')
            if (getActivePanel() !== 'desk') setActivePanel('desk')
        } else {
            applyTabVisibilityForMode('management')
        }
    } else {
        console.log(`🆕 スロット ${slotId} で新規ゲーム開始`)
        resetGameState()

        if (difficulty) {
            const difficultyConfig = DIFFICULTY_SETTINGS[difficulty]
            game.difficulty = difficulty
            game.money = difficultyConfig.startingMoney
            console.log(`🎮 難易度: ${difficultyConfig.name}, 初期資金: ${difficultyConfig.startingMoney / 10000}万円`)
        }

        resetCompetitors()
        competitors.forEach(c => {
            c.share = c.initialShare
        })

        addInitialEmployee()

        // Sprint E: 新方式 (Coachmark) が既定。disabled=true はロールバックで旧方式
        setTimeout(() => {
            if (!game.tutorialCompleted) {
                if (game.tutorialV2?.disabled) {
                    (window as any).startTutorial?.()
                } else if (game.tutorialV2?.enabled) {
                    (window as any).startCoachmarks?.()
                }
            }
        }, 1000)
    }

    // R-1: 初期化完了後の描画系は critical のため silent fail を警告化
    // generateNews は戻り値を a2ui ニュースカードの初期表示に使うため invokeWindowCritical を使わず個別に呼ぶ
    const initialNews = (window as any).generateNews?.() as GeneratedNews | undefined
    if (!initialNews) {
        console.warn('[GameManager] critical: window.generateNews is not bound. Initialization may be incomplete.')
    } else {
        const initialNewsItem = pickMonthlyNews(initialNews, game.lastNewsCategory, [])
        if (initialNewsItem) getA2UIManager().showMonthlyNews(initialNewsItem)
    }
    invokeWindowCritical('updateDisplay')
    invokeWindowCritical('updateRanking')
    invokeWindowCritical('initCharts')
    invokeWindowCritical('showPanel', null, getActivePanel())

    // Sprint E: ロード時は coachmark の queue/pendingId を続きから再開
    if (slotData && game.tutorialV2?.enabled && !game.tutorialV2.disabled) {
        setTimeout(() => (window as any).resumeCoachmarks?.(), 1000)
    }
}

// ============================================
// 初期化
// ============================================

// ============================================
// アニメーションシステム
// ============================================

export function initAnimationSystem(): void {
    console.log('[Game] Initializing CSS animation system...')
    try {
        initCharacterRenderer('game-canvas')
        console.log('[Game] CSS character manager ready, adding existing employees...')
        syncAllEmployeeSprites()
    } catch (error) {
        console.error('[Game] Failed to initialize animation system:', error)
    }
}

export function determineJobType(employee: any): JobType {
    if (employee.jobType) {
        return employee.jobType as JobType
    }

    const skills = {
        technical: employee.technical || 0,
        sales: employee.sales || 0,
        planning: employee.planning || 0,
        management: employee.management || 0
    }

    const maxSkill = Math.max(...Object.values(skills))

    if (skills.technical === maxSkill) return 'developer'
    if (skills.sales === maxSkill) return 'sales'
    if (skills.planning === maxSkill) return 'marketing'
    return 'manager'
}

export function syncAllEmployeeSprites(): void {
    const game = getGame()
    console.log('[Game] Syncing all employee sprites...')
    characterManager.clearAllCharacters()

    game.employees.forEach((emp: any) => {
        const jobType = determineJobType(emp)
        const name = emp.name || `社員${emp.id}`
        characterManager.addCharacter(String(emp.id), name, jobType, () => {
            // TODO: 接続 - showEmployeeDetail は game.ts から直接呼び出し中
            (window as any).showEmployeeDetail?.(emp)
        })
        updateEmployeeAnimation(emp)
    })
}

// アニメーション状態の決定ロジック (DOM 非依存の純関数)。
// 優先順位: ストレス過多 > モチベーション低下 > 通常稼働。稼働していなければ常に idle
export function determineAnimationState(isWorking: boolean, stress: number, motivation: number): AnimationState {
    if (!isWorking) return 'idle'
    if (stress > 70) return 'stressed'
    if (motivation < 30) return 'idle'
    return 'working'
}

export function updateEmployeeAnimation(employee: any): void {
    const game = getGame()

    // 稼働判定は HRManager.updateMonthlyStress と同一基準
    // (assignedEmployees は未実装の明示アサイン用。現行は製品あり×開発部で稼働)
    const isWorking =
        (game.products.length > 0 && employee.department === 'development') ||
        game.products?.some((p: any) =>
            p.assignedEmployees?.includes(employee.id) ||
            p.assignedEmployees?.some((e: any) => e.id === employee.id)
        )

    const stress = employee.stress || 0
    const motivation = employee.motivation ?? 50
    const animState = determineAnimationState(isWorking, stress, motivation)

    characterManager.setAnimation(String(employee.id), animState)
}

export function syncEmployeeAnimations(): void {
    const game = getGame()
    game.employees.forEach((emp: any) => updateEmployeeAnimation(emp))
}

// ============================================
// メインターン進行（オーケストレーション）
// ============================================

export function nextTurn(): void {
    const game = getGame()

    // TODO: 接続 - requireCompanyActive は game.ts から直接呼び出し中
    if (game.isBankrupt) return

    // ======= 社長モード: ゲームオーバーチェック =======
    if (game.gameMode === 'ceo' && game.isGameOver) {
        ;(window as any).showModal?.('🏢 ゲームオーバー', game.gameOverReason || '経営が破綻しました。')
        return
    }

    game.turn++
    syncEmployeeAnimations()
    game.week++

    // ======= 社長モード: ターン開始処理 =======
    if (game.gameMode === 'ceo' && game.ceo) {
        // 0. 週次リセット
        CEOManager.resetWeeklyLimits(game)

        // 1. 調査結果の反映
        const investigationResults = DocumentManager.processInvestigationResults(game)
        if (investigationResults.length > 0) {
            const msgs = investigationResults.map((d: any) => `<div style="margin:8px 0;padding:10px;background:rgba(52,152,219,0.08);border-radius:8px;"><strong>🔍 ${d.title}</strong><br>${d.investigationResult}</div>`).join('')
            ;(window as any).showModal?.('🔍 調査結果報告', msgs, true)
        }

        // 2. 長期投資の効果発現
        const longTermOutcomes = DocumentManager.processLongTermEffects(game)
        if (longTermOutcomes.length > 0) {
            setTimeout(() => {
                const msgs = longTermOutcomes.map((o: any) => `<div style="margin:8px 0;padding:10px;background:rgba(46,204,113,0.1);border-radius:8px;">🌱 ${o.description}</div>`).join('')
                ;(window as any).showModal?.('🌱 投資の成果', msgs, true)
            }, 300)
        }

        // 3. 因果チェーンの処理
        const causalResults = DocumentManager.processCausalChainEffects(game)
        if (causalResults.documents.length > 0) {
            game.documentQueue.push(...causalResults.documents)
        }

        // 4. 指示に基づく書類生成
        for (const directive of game.pendingDirectives) {
            const docs = DocumentManager.generateFromDirective(game, directive)
            game.documentQueue.push(...docs)
        }
        game.pendingDirectives = []

        // 5. 通常の書類生成
        const newDocs = DocumentManager.generateDocuments(game)
        game.documentQueue.push(...newDocs)

        // 6. 期限切れ書類処理
        const expired = DocumentManager.processExpiredDocuments(game)
        if (expired.length > 0) {
            setTimeout(() => {
                const msgs = expired.map((o: any) => `<div style="margin:6px 0;color:#e74c3c;">⚠️ ${o.description}</div>`).join('')
                ;(window as any).showModal?.('⚠️ 期限切れ書類', msgs, true)
            }, 600)
        }

        // 7. 訪問者チェック（決裁連動を含む）
        let forcedVisitorType: string | undefined
        if (causalResults.visitorTypes.length > 0) {
            forcedVisitorType = causalResults.visitorTypes[0]
        }
        game.currentVisitor = VisitorManager.checkForVisitor(game, forcedVisitorType)

        // 8. CEO支持率更新
        CEOManager.updateApprovalRating(game)

        // 9. 履歴の刈り込み
        DocumentManager.pruneHistory(game)
        VisitorManager.pruneVisitorHistory(game)
    }

    // Phase 2: 隠れ特性の発動チェック（週次）
    const hiddenTraitMessages: Array<{ name: string; trait: any }> = []
    game.employees.forEach((emp: any) => {
        if (emp.hiddenTraitRevealed) return
        if (!emp.joinedTurn) emp.joinedTurn = 1

        const turnsSinceJoined = game.turn - emp.joinedTurn
        const hiddenTrait = HIDDEN_TRAITS[emp.hiddenTrait]

        if (!hiddenTrait) return

        if (turnsSinceJoined >= hiddenTrait.revealTurn) {
            emp.hiddenTraitRevealed = true
            hiddenTraitMessages.push({
                name: emp.name,
                trait: hiddenTrait
            })

            if (emp.hiddenTrait === 'latent_leader') {
                emp.abilities.management = Math.min(100, emp.abilities.management + 30)
            } else if (emp.hiddenTrait === 'late_bloomer') {
                Object.keys(emp.abilities).forEach((key: string) => {
                    emp.abilities[key] = Math.min(100, Math.floor(emp.abilities[key] * 1.5))
                })
            } else if (emp.hiddenTrait === 'self_taught') {
                Object.keys(emp.abilities).forEach((key: string) => {
                    emp.abilities[key] = Math.min(100, emp.abilities[key] + 15)
                })
            }

            if (!emp.growthHistory) emp.growthHistory = []
            emp.growthHistory.push({
                turn: game.turn,
                event: '隠れ特性判明',
                description: `${hiddenTrait.emoji} ${hiddenTrait.name}が判明 - ${hiddenTrait.effect}`
            })
        }
    })

    if (game.week > 4) {
        game.week = 1
        game.month++
        if (game.month > 12) {
            game.month = 1
            game.year++
        }

        // Phase 2: self_taught特性で毎月自動スキルアップ
        game.employees.forEach((emp: any) => {
            if (emp.hiddenTraitRevealed && emp.hiddenTrait === 'self_taught') {
                const randomAbility = ['technical', 'sales', 'planning', 'management'][Math.floor(Math.random() * 4)]
                emp.abilities[randomAbility] = Math.min(100, emp.abilities[randomAbility] + 5)
            }
        })

        // B-1: 月次ストレス更新 (稼働中は蓄積、待機中は回復。>70 で stressed アニメ)
        updateMonthlyStress()

        // 製品駆動のシェア成長: 製品1本につき月+0.2% (上限60)。
        // 従来はマーケ (上限15) 以外にシェア加算源がなく、オフィスLv5 (22%) や
        // 上位実績 (30/50%) が構造的に到達不能だった
        if (game.products.length > 0) {
            game.marketShare = Math.min(60, game.marketShare + game.products.length * 0.2)
        }

        // I-5: インライン月次計算を FinanceManager.calculateMonthlyRevenue() に統一
        // （旧コードは FinanceManager 側と同一ロジックを二重実装しており、片方の修正が
        //   他方に反映されないリスクがあった）
        const monthly = FinanceManager.calculateMonthlyRevenue()
        const { revenue, salaryTotal, interest, profit, isBankrupt } = monthly

        if (isBankrupt) {
            // game.isBankrupt は calculateMonthlyRevenue 内で設定済み
            ;(window as any).updateDisplay?.()
            ;(window as any).renderActivePanel?.()
            ;(window as any).updateRanking?.()
            ;(window as any).showModal?.('💔 ゲームオーバー', '資金不足で倒産しました...<br>再スタートしてください。', true)
            return
        }

        const summaryLines = [
            `📊 売上: ${Math.floor(revenue / 10000)}万円`,
            `👥 人件費: ${Math.floor(salaryTotal / 10000)}万円`
        ]
        if (interest > 0) {
            summaryLines.push(`📈 利息: ${Math.floor(interest / 10000)}万円`)
        }
        const profitColor = profit >= 0 ? '#4caf50' : '#f44336'
        summaryLines.push(`<div style="margin-top: 8px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
            💰 最終利益: <strong style="color: ${profitColor}">${Math.floor(profit / 10000)}万円</strong>
        </div>`)
        ;(window as any).showModal?.('📅 月次決算', summaryLines.join('<br>'), true)
        const attackResults = ((window as any).updateCompetitors?.() || []) as CompetitorAttackLike[]
        const monthlyNews = (window as any).generateNews?.() as GeneratedNews | undefined

        // a2ui: 市況/競合ニュース → ニュースカード (競合攻撃があればそちらを優先表示)
        const monthlyNewsItem = pickMonthlyNews(monthlyNews ?? null, game.lastNewsCategory, attackResults)
        if (monthlyNewsItem) {
            getA2UIManager().showMonthlyNews(monthlyNewsItem)
        }

        // a2ui: 月次決算 → 財務ダッシュボードカード更新
        getA2UIManager().showFinanceSummary(
            buildFinanceSummaryData({ revenue, salaryTotal, interest, profit, cash: game.money, debt: game.debt })
        )

        // a2ui: 資金危険水域への新規突入時のみアドバイザーカード (継続中は再発火しない)
        const monthlyCost = salaryTotal + interest
        const isDanger = isFinanceDanger(game.money, monthlyCost)
        if (shouldFireDangerAdvisor(_wasFinanceDanger, isDanger)) {
            getA2UIManager().showDangerAdvisor(buildDangerAdvisorMessage(game.money, monthlyCost))
        }
        _wasFinanceDanger = isDanger

        // Sprint E: 初黒字で条件発火型 coachmark を投入 (shownIds が重複を防ぐ)
        if (profit > 0) {
            ;(window as any).enqueueCoachmark?.('cond_first_profit')
        }
    }

    // Phase 2: 隠れ特性が判明した場合、通知を表示
    if (hiddenTraitMessages.length > 0) {
        setTimeout(() => {
            const messages = hiddenTraitMessages.map(msg => {
                return `<div style="margin: 12px 0; padding: 12px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px;">
                    <strong>${escapeHtml(msg.name)}</strong>の隠れた才能が開花！<br>
                    <span style="font-size: 18px;">${msg.trait.emoji} ${escapeHtml(msg.trait.name)}</span><br>
                    <span style="font-size: 13px; color: #666;">${escapeHtml(msg.trait.effect)}</span>
                </div>`
            }).join('')
            ;(window as any).showModal?.('✨ 隠れた特性が判明！', messages, true)
            ;(window as any).renderActivePanel?.()
        }, 500)
    }

    // オフィスアップグレードチェック
    checkOfficeUpgrade()

    // フェーズ2: 実績チェック
    // checkAchievements は新規解除分を返すが v2.2.0 まで返り値が捨てられており、
    // 解除演出も報酬付与 (showAchievementUnlocked 内) も一度も発火していなかった。
    // 複数同時解除はモーダルが上書きし合うため階段状に遅延させる
    const newAchievements: any[] = (window as any).checkAchievements?.() || []
    newAchievements.forEach((ach: any, i: number) => {
        setTimeout(() => (window as any).showAchievementUnlocked?.(ach), i * 1000)
    })

    // 経営理論図鑑: プレイヤーの体験に対応する理論を解禁 (toast 通知、手を止めない)
    const newTheories: any[] = (window as any).checkTheories?.() || []
    newTheories.forEach((theory: any, i: number) => {
        setTimeout(() => (window as any).showTheoryUnlocked?.(theory), 900 + i * 1500)
    })

    // フェーズ2: チュートリアル進行
    ;(window as any).advanceTutorialByAction?.('end_turn')

    // ======= 社長モード: 月次・四半期後処理 =======
    if (game.gameMode === 'ceo' && game.ceo) {
        // 株価更新
        CEOManager.calculateStockPrice(game)

        // 四半期チェック
        if (CEOManager.isQuarterStart(game)) {
            const review = CEOManager.generateQuarterlyReview(game)
            if (review) {
                setTimeout(() => {
                    ;(window as any).showModal?.('📊 四半期レビュー', renderQuarterlyReview(game), true)
                    // レビュー後に方針選択を促す
                    setTimeout(() => {
                        ;(window as any).showModal?.('🎯 経営方針', renderPolicySelection(game), true)
                    }, 1000)
                }, 800)
            }
        }

        // ゲームオーバー判定
        const gameOverReason = CEOManager.checkGameOver(game)
        if (gameOverReason) {
            game.isGameOver = true
            game.gameOverReason = gameOverReason
            setTimeout(() => {
                const ceo = game.ceo!
                ;(window as any).showModal?.('🏢 ゲームオーバー', `<div style="text-align:center;padding:20px;"><div style="font-size:48px;margin-bottom:16px;">😔</div><p style="font-size:16px;">${escapeHtml(gameOverReason)}</p><p style="margin-top:16px;color:#888;">決裁回数: ${ceo.decisionsCorrect + ceo.decisionsWrong}回 | 正答率: ${ceo.decisionsCorrect + ceo.decisionsWrong > 0 ? Math.floor(ceo.decisionsCorrect / (ceo.decisionsCorrect + ceo.decisionsWrong) * 100) : 0}%</p></div>`, true)
            }, 1200)
        }

        // 訪問者ダイアログの表示
        if (game.currentVisitor) {
            setTimeout(() => {
                ;(window as any).showModal?.('🚪 来客', renderVisitorDialog(game.currentVisitor!), true)
            }, 400)
        }
    }

    // TODO: 接続
    ;(window as any).updateDisplay?.()
    ;(window as any).renderActivePanel?.()
    ;(window as any).updateRanking?.()
}

// ============================================
// セーブ
// ============================================

export async function saveGame(): Promise<void> {
    const game = getGame()
    if (game.isBankrupt) return

    try {
        // I-1: _pendingCausalEffects はランタイム専用フィールドのため、
        // 永続化対象から除外する（ストレージ改ざん経由の triggerTurn / resultCategory
        // 任意操作を防止）。再ロード時は normalizeGameState():208 が空配列で初期化する。
        const saveData: any = Object.assign({}, game, { activePanel: getActivePanel() })
        delete saveData._pendingCausalEffects

        const metadata: SaveMetadata = {
            slotId: getCurrentSlotId(),
            companyName: game.companyName || '株式会社スタートアップ',
            playTime: game.turn * 60,
            lastSaveDate: new Date().toISOString(),
            gameDate: {
                year: game.year || 2025,
                month: game.month || 1,
                week: game.week || 1
            },
            money: game.money,
            employeeCount: game.employees.length,
            marketShare: parseFloat((game.marketShare || 0.1).toFixed(2)),
            brandLevel: Math.floor((game.brandPower || 1) / 20)
        }

        await saveSlotData(getCurrentSlotId(), saveData, metadata)

        ;(window as any).showModal?.('💾 保存完了', `スロット ${getCurrentSlotId()} に保存しました`)
    } catch (error) {
        console.error('Failed to save game', error)
        ;(window as any).showModal?.('保存失敗', '保存に失敗しました')
    }
}

// ============================================
// リスタート
// ============================================

export async function restartGame(): Promise<void> {
    ;(window as any).closeModal?.()
    resetGameState()
    addInitialEmployee()

    // a2ui: 前セッションの浮遊カード (ニュース/アドバイザー/財務サマリー) を一掃し、
    // 資金危険水域の発火判定もリセットする
    getA2UIManager().clearAll()
    _wasFinanceDanger = false

    // 管理モードに戻ったタブ可視性を復元
    applyTabVisibilityForMode('management')

    // TODO: 接続
    ;(window as any).updateDisplay?.()
    ;(window as any).renderEmployees?.()
    ;(window as any).renderProducts?.()
    ;(window as any).renderMarket?.()
    ;(window as any).renderFinance?.()
    ;(window as any).updateRanking?.()
    ;(window as any).initCharts?.()
    ;(window as any).showPanel?.(null, 'overview')
    const restartNews = (window as any).generateNews?.() as GeneratedNews | undefined
    if (restartNews) {
        const game = getGame()
        const restartNewsItem = pickMonthlyNews(restartNews, game.lastNewsCategory, [])
        if (restartNewsItem) getA2UIManager().showMonthlyNews(restartNewsItem)
    }
    ;(window as any).showModal?.('🔄 再スタート', '新しいゲームを開始しました')
}
