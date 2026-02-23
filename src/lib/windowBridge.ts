// ビジネスエンパイア 2.0 - Window互換レイヤー
// Phase 2: 各モジュールから import して window にバインド
// HTML onclick ハンドラ互換性のため、34個の関数を window に公開

// Store
import { getGame } from './store/gameStore'

// GameManager
import { init, initWithSlot, saveGame, restartGame, nextTurn, initAnimationSystem, syncEmployeeAnimations } from './managers/GameManager'

// UI: renderers
import { showPanel, showAllAchievements, updateDisplay, renderActivePanel, updateRanking, renderEmployees, renderProducts, renderMarket, renderFinance } from './ui/renderers'

// UI: modals
import {
    showModal, closeModal, closeDetailModal,
    showHiring, showDepartmentSelectionForHiring, showHiringForDepartment,
    hireSelectedCandidate,
    showEmployeeDetail, showDepartmentChangeModal,
    showSkillTreeModal, switchSkillCategory,
    showPersonalityDetail, showTraitDetail,
    trainEmployees, doMarketing
} from './ui/modals'

// Managers (UI-facing functions that need window binding)
import { promoteEmployee, changeDepartment, unlockSkill } from './managers/HRManager'
import { executeTraining } from './managers/HRManager'
import { developProduct, executeMarketing } from './managers/ProductManager'
import { getLoan, repayLoan } from './managers/FinanceManager'

// MarketManager
import { generateNews, updateCompetitors } from './managers/MarketManager'

// AchievementManager
import { checkAchievements } from './managers/AchievementManager'

// Charts
import { initCharts } from './ui/charts.integration'

// TutorialManager
import { startTutorial, advanceTutorial, skipTutorial, toggleTutorial, advanceTutorialByAction } from './managers/TutorialManager'

// ============================================
// Window バインディング（34個）
// ============================================

// ゲームデータオブジェクト
;(window as any).game = getGame()

// メインゲーム制御 (GameManager)
;(window as any).init = init
;(window as any).initWithSlot = initWithSlot
;(window as any).saveGame = saveGame
;(window as any).restartGame = restartGame
;(window as any).nextTurn = nextTurn
;(window as any).initAnimationSystem = initAnimationSystem
;(window as any).syncEmployeeAnimations = syncEmployeeAnimations

// パネル・モーダル制御 (renderers / modals)
;(window as any).showPanel = showPanel
;(window as any).showModal = showModal
;(window as any).closeModal = closeModal
;(window as any).closeDetailModal = closeDetailModal

// 人事管理 (modals + HRManager)
;(window as any).showHiring = showHiring
;(window as any).showDepartmentSelectionForHiring = showDepartmentSelectionForHiring
;(window as any).showHiringForDepartment = showHiringForDepartment
;(window as any).hireSelectedCandidate = hireSelectedCandidate
;(window as any).trainEmployees = trainEmployees
;(window as any).executeTraining = executeTraining
;(window as any).promoteEmployee = promoteEmployee
;(window as any).showEmployeeDetail = showEmployeeDetail
;(window as any).changeDepartment = changeDepartment
;(window as any).showDepartmentChangeModal = showDepartmentChangeModal

// スキル・性格・特性システム (modals)
;(window as any).showSkillTreeModal = showSkillTreeModal
;(window as any).switchSkillCategory = switchSkillCategory
;(window as any).unlockSkill = unlockSkill
;(window as any).showPersonalityDetail = showPersonalityDetail
;(window as any).showTraitDetail = showTraitDetail

// 製品開発・市場・財務 (modals + Managers)
;(window as any).developProduct = developProduct
;(window as any).doMarketing = doMarketing
;(window as any).executeMarketing = executeMarketing
;(window as any).getLoan = getLoan
;(window as any).repayLoan = repayLoan

// 実績システム (renderers + AchievementManager)
;(window as any).showAllAchievements = showAllAchievements
;(window as any).checkAchievements = checkAchievements

// 表示更新 (renderers)
;(window as any).updateDisplay = updateDisplay
;(window as any).renderActivePanel = renderActivePanel
;(window as any).updateRanking = updateRanking
;(window as any).renderEmployees = renderEmployees
;(window as any).renderProducts = renderProducts
;(window as any).renderMarket = renderMarket
;(window as any).renderFinance = renderFinance

// 市場・ニュース (MarketManager)
;(window as any).generateNews = generateNews
;(window as any).updateCompetitors = updateCompetitors

// チャート (charts.integration)
;(window as any).initCharts = initCharts

// チュートリアルシステム (TutorialManager)
;(window as any).startTutorial = startTutorial
;(window as any).advanceTutorial = advanceTutorial
;(window as any).skipTutorial = skipTutorial
;(window as any).toggleTutorial = toggleTutorial
;(window as any).advanceTutorialByAction = advanceTutorialByAction

console.log('[windowBridge] 46 functions bound to window')
