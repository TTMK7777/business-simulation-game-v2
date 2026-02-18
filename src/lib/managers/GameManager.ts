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
import { PERSONALITIES, HIDDEN_TRAITS, generateTemperament } from '../config/personalities'
import { OFFICE_LEVELS } from '../config/offices'
import {
    DIFFICULTY_SETTINGS,
    BALANCE_CONFIG,
    GAME_CONSTANTS,
    DEBUG_CONFIG,
    debugLog,
    type DifficultyLevel
} from '../gameConfig'
import { storageHelpers, loadSlotData, saveSlotData, type SaveMetadata } from '../storage'
import { characterManager, initCharacterRenderer, type AnimationState, type JobType } from '../cssCharacterManager'

// ======= 社長モード =======
import * as DocumentManager from './DocumentManager'
import * as VisitorManager from './VisitorManager'
import * as CEOManager from './CEOManager'
import { renderQuarterlyReview, renderPolicySelection } from '../ui/ceoStatus'
import { renderVisitorDialog } from '../ui/visitorDialog'

// ============================================
// 定数
// ============================================
const LOAN_INTEREST_RATE = 0.02
const SAVE_KEY = 'businessEmpire'

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
        qualification: null,
        growthHistory: [
            { turn: 1, event: '入社', description: '会社に参加しました' }
        ]
    }
    game.employees.push(initialEmployee)
}

// ============================================
// ゲームロード
// ============================================

export async function loadGameFromStorage(): Promise<boolean> {
    const game = getGame()
    try {
        const saved = await storageHelpers.getItem(SAVE_KEY)
        if (!saved) return false
        const parsed = JSON.parse(saved)
        const merged = Object.assign(cloneDefaults(), parsed)
        overwriteGameState(merged)
        normalizeGameState()
        const panel = typeof parsed.activePanel === 'string' ? parsed.activePanel : 'overview'
        setActivePanel(panel)
        delete (game as any).activePanel
        return true
    } catch (error) {
        console.error('Failed to load save data', error)
        return false
    }
}

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
            const deskTab = document.querySelector('.tab[data-panel="desk"]') as HTMLElement
            if (deskTab) deskTab.style.display = ''
            if (getActivePanel() !== 'desk') setActivePanel('desk')
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

        // TODO: 接続 - startTutorial は game.ts から直接呼び出し中
        setTimeout(() => {
            if (!game.tutorialCompleted) {
                (window as any).startTutorial?.()
            }
        }, 1000)
    }

    // TODO: 接続 - これらは各モジュールから import して呼び出し予定
    ;(window as any).generateNews?.()
    ;(window as any).updateDisplay?.()
    ;(window as any).updateRanking?.()
    ;(window as any).initCharts?.()
    ;(window as any).showPanel?.(null, getActivePanel())
}

// ============================================
// 初期化
// ============================================

export async function init(): Promise<void> {
    const game = getGame()
    const loaded = await loadGameFromStorage()
    if (!loaded) {
        resetGameState()
        addInitialEmployee()
    } else {
        normalizeGameState()
        if (game.employees.length === 0) addInitialEmployee()
    }

    // TODO: 接続
    ;(window as any).generateNews?.()
    ;(window as any).updateDisplay?.()
    ;(window as any).updateRanking?.()
    ;(window as any).initCharts?.()
    ;(window as any).showPanel?.(null, getActivePanel())
}

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

export function updateEmployeeAnimation(employee: any): void {
    const game = getGame()
    let animState: AnimationState = 'idle'

    const isWorking = game.products?.some((p: any) =>
        p.assignedEmployees?.includes(employee.id) ||
        p.assignedEmployees?.some((e: any) => e.id === employee.id)
    )

    if (isWorking) {
        const stress = employee.stress || 0
        animState = stress > 70 ? 'stressed' : 'working'
    }

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
            ;(window as any).showModal?.('🔍 調査結果報告', msgs)
        }

        // 2. 長期投資の効果発現
        const longTermOutcomes = DocumentManager.processLongTermEffects(game)
        if (longTermOutcomes.length > 0) {
            setTimeout(() => {
                const msgs = longTermOutcomes.map((o: any) => `<div style="margin:8px 0;padding:10px;background:rgba(46,204,113,0.1);border-radius:8px;">🌱 ${o.description}</div>`).join('')
                ;(window as any).showModal?.('🌱 投資の成果', msgs)
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
                ;(window as any).showModal?.('⚠️ 期限切れ書類', msgs)
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

        let revenue = 0
        const difficultyMultiplier = BALANCE_CONFIG.difficultyMultipliers[game.difficulty || 'normal']

        game.products.forEach((product: any) => {
            let salesMultiplier = 1.0

            const charismaticCount = game.employees.filter((emp: any) => emp.personalityKey === 'charismatic').length
            if (charismaticCount > 0) {
                salesMultiplier *= (1 + charismaticCount * 0.25)
            }

            salesMultiplier *= (1 + game.marketShare * BALANCE_CONFIG.economy.marketShareRevenueBonus)
            salesMultiplier *= (1 + game.brandPower * BALANCE_CONFIG.economy.brandPowerRevenueBonus)
            salesMultiplier *= difficultyMultiplier.revenueMultiplier

            const baseRevenue = BALANCE_CONFIG.economy.productRevenueBase
            const qualityRevenue = product.quality * BALANCE_CONFIG.economy.productRevenueMultiplier
            const productRevenue = Math.floor((baseRevenue + qualityRevenue) * salesMultiplier)

            product.sales += productRevenue
            revenue += productRevenue

            debugLog('balance', `製品売上計算: ${product.name}`, {
                baseRevenue,
                qualityRevenue,
                salesMultiplier,
                finalRevenue: productRevenue
            })
        })

        const salaryTotal = game.employees.reduce((sum: number, emp: any) => sum + emp.salary, 0)
        const interest = game.debt > 0 ? Math.floor(game.debt * LOAN_INTEREST_RATE) : 0
        game.monthlyRevenue = revenue
        game.revenueHistory.push(revenue)
        const profit = revenue - salaryTotal - interest
        game.money += profit

        if (game.money < 0) {
            game.isBankrupt = true
            // TODO: 接続
            ;(window as any).updateDisplay?.()
            ;(window as any).renderActivePanel?.()
            ;(window as any).updateRanking?.()
            ;(window as any).showModal?.('💔 ゲームオーバー', '資金不足で倒産しました...<br>再スタートしてください。')
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
        ;(window as any).showModal?.('📅 月次決算', summaryLines.join('<br>'))
        ;(window as any).updateCompetitors?.()
        ;(window as any).generateNews?.()
    }

    // Phase 2: 隠れ特性が判明した場合、通知を表示
    if (hiddenTraitMessages.length > 0) {
        setTimeout(() => {
            const messages = hiddenTraitMessages.map(msg => {
                return `<div style="margin: 12px 0; padding: 12px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px;">
                    <strong>${msg.name}</strong>の隠れた才能が開花！<br>
                    <span style="font-size: 18px;">${msg.trait.emoji} ${msg.trait.name}</span><br>
                    <span style="font-size: 13px; color: #666;">${msg.trait.effect}</span>
                </div>`
            }).join('')
            ;(window as any).showModal?.('✨ 隠れた特性が判明！', messages)
            ;(window as any).renderActivePanel?.()
        }, 500)
    }

    // オフィスアップグレードチェック
    checkOfficeUpgrade()

    // フェーズ2: 実績チェック
    ;(window as any).checkAchievements?.()

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
                    ;(window as any).showModal?.('📊 四半期レビュー', renderQuarterlyReview(game))
                    // レビュー後に方針選択を促す
                    setTimeout(() => {
                        ;(window as any).showModal?.('🎯 経営方針', renderPolicySelection(game))
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
                ;(window as any).showModal?.('🏢 ゲームオーバー', `<div style="text-align:center;padding:20px;"><div style="font-size:48px;margin-bottom:16px;">😔</div><p style="font-size:16px;">${gameOverReason}</p><p style="margin-top:16px;color:#888;">決裁回数: ${ceo.decisionsCorrect + ceo.decisionsWrong}回 | 正答率: ${ceo.decisionsCorrect + ceo.decisionsWrong > 0 ? Math.floor(ceo.decisionsCorrect / (ceo.decisionsCorrect + ceo.decisionsWrong) * 100) : 0}%</p></div>`)
            }, 1200)
        }

        // 訪問者ダイアログの表示
        if (game.currentVisitor) {
            setTimeout(() => {
                ;(window as any).showModal?.('🚪 来客', renderVisitorDialog(game.currentVisitor!))
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
        const saveData = Object.assign({}, game, { activePanel: getActivePanel() })

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

    // TODO: 接続
    ;(window as any).updateDisplay?.()
    ;(window as any).renderEmployees?.()
    ;(window as any).renderProducts?.()
    ;(window as any).renderMarket?.()
    ;(window as any).renderFinance?.()
    ;(window as any).updateRanking?.()
    ;(window as any).initCharts?.()
    ;(window as any).showPanel?.(null, 'overview')
    ;(window as any).generateNews?.()
    await storageHelpers.removeItem(SAVE_KEY)
    ;(window as any).showModal?.('🔄 再スタート', '新しいゲームを開始しました')
}
