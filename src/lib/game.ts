// ビジネスエンパイア 2.0 - エントリポイント（Phase 2 スリム版）
// 元の game.ts (4,406行) をモジュール分割し、UI+ロジック混合関数のみ残す

// ============================================
// 外部ライブラリ・既存モジュール
// ============================================
import { characterManager } from './cssCharacterManager'

// ============================================
// config/ からの定数
// ============================================
import { DEPARTMENTS, POSITIONS } from './config/departments'
import { SKILL_TREE, SKILL_EFFECTS } from './config/skills'

// ============================================
// gameConfig からの設定
// ============================================
import {
    GAME_CONSTANTS,
} from './gameConfig'

// ============================================
// store/ からの状態管理
// ============================================
import {
    getGame, setActivePanel,
} from './store/gameStore'

// ============================================
// managers/ からのビジネスロジック
// ============================================
import {
    init, initWithSlot, saveGame, restartGame, nextTurn,
    initAnimationSystem, syncEmployeeAnimations,
    determineJobType,
} from './managers/GameManager'

import {
    calculateTeamCompatibility, calculateGrowthMultiplier,
    generateCandidate, generateCandidateForDepartment,
    canPromote, canUnlockSkill,
} from './managers/HRManager'

import {
    checkAchievements,
} from './managers/AchievementManager'

import {
    generateNews, updateCompetitors,
} from './managers/MarketManager'


import {
    startTutorial,
    advanceTutorial, advanceTutorialByAction,
    skipTutorial,
    toggleTutorial
} from './managers/TutorialManager'

// ============================================
// ui/ からのUI関数
// ============================================
import {
    showPanel, showAllAchievements,
    renderAchievements,
    renderActivePanel, updateDisplay, updateControls,
    updateRanking
} from './ui/renderers'

import {
    showModal, closeModal, closeDetailModal,
    showAchievementUnlocked,
    showHiring, showDepartmentSelectionForHiring,
    showHiringForDepartment, hireSelectedCandidate,
    showTraitDetail, showPersonalityDetail,
    showDepartmentChangeModal, showEmployeeDetail,
    showSkillTreeModal,
    switchSkillCategory, trainEmployees, doMarketing,
    requireCompanyActive, escapeHtml
} from './ui/modals'

import {
    initCharts, updateCharts, updateMarketChart,
} from './ui/charts.integration'

// ======= 社長モード統合 =======
import * as DocumentManager from './managers/DocumentManager'
import * as VisitorManager from './managers/VisitorManager'
import * as CEOManager from './managers/CEOManager'
import { createDefaultCEOStatus } from './config/ceo'
import { renderDocumentStack, renderStatusTab, renderEmployeesForDesk } from './ui/deskView'
import { renderDocumentDetail, renderVerdictResult } from './ui/documentDetail'
import { renderVisitorResult } from './ui/visitorDialog'
import { renderDirectivePanel } from './ui/ceoStatus'
import type { CEOTrait, PolicyFocus, DocumentVerdict } from './types/index'

// ============================================
// モジュールレベルエイリアス
// ============================================
const game = getGame()

// ============================================
// Category B: UI+ロジック混合関数
// これらは Manager の返り値を使わず、直接 game 状態を操作しつつ
// UI (showModal, updateDisplay) を呼ぶため、ここに残す
// ============================================

function hireEmployee(candidate: any) {
    if (!requireCompanyActive()) return
    if (game.money < candidate.salary * 3) {
        showModal('採用失敗', '資金不足です（3ヶ月分の給与が必要）')
        return
    }
    game.money -= candidate.salary * 3
    game.employees.push(candidate)

    // CSSキャラクター追加
    const jobType = determineJobType(candidate)
    const name = candidate.name || `社員${candidate.id}`
    characterManager.addCharacter(String(candidate.id), name, jobType, () => {
        showEmployeeDetail(candidate)
    })

    // 一時データをクリア
    ;(window as any).currentCandidate = null

    updateDisplay()
    renderActivePanel()
    closeModal()
    showModal('🎉 採用成功', `${escapeHtml(candidate.name)}さんを採用しました！`)

    advanceTutorialByAction('hire_employee')
}

function changeDepartment(employeeId: number, newDepartmentKey: string) {
    if (!requireCompanyActive()) return

    const employee = game.employees.find((e: any) => e.id === employeeId)
    if (!employee) {
        showModal('エラー', '従業員が見つかりません')
        return
    }

    if (employee.department === newDepartmentKey) {
        showModal('異動失敗', 'すでにその部署に所属しています')
        return
    }

    const oldDept = DEPARTMENTS[employee.department]
    const newDept = DEPARTMENTS[newDepartmentKey]

    employee.department = newDepartmentKey

    if (!employee.growthHistory) employee.growthHistory = []
    employee.growthHistory.push({
        turn: game.turn,
        event: '部署異動',
        description: `${oldDept.emoji} ${oldDept.name} から ${newDept.emoji} ${newDept.name} へ異動`
    })

    updateDisplay()
    renderActivePanel()
    closeModal()
    showModal('🎉 異動完了', `${escapeHtml(employee.name)}を${newDept.emoji} ${newDept.name}に異動させました！`)
}

function promoteEmployee(employeeId: number) {
    if (!requireCompanyActive()) return

    const employee = game.employees.find((e: any) => e.id === employeeId)
    if (!employee) {
        showModal('エラー', '従業員が見つかりません')
        return
    }

    if (!canPromote(employee)) {
        showModal('昇進不可', '昇進に必要な能力値を満たしていません')
        return
    }

    const positionOrder = ['staff', 'senior', 'manager', 'director']
    const currentIndex = positionOrder.indexOf(employee.position)
    const nextPositionKey = positionOrder[currentIndex + 1]

    const oldPosition = POSITIONS[employee.position]
    const newPosition = POSITIONS[nextPositionKey]

    employee.position = nextPositionKey
    const baseSalary = employee.salary / oldPosition.salaryMultiplier
    employee.salary = Math.floor(baseSalary * newPosition.salaryMultiplier)

    const promotionBonus: Record<string, number> = { senior: 3, manager: 5, director: 10 }
    const bonusPoints = promotionBonus[nextPositionKey] || 0
    employee.skillPoints = (employee.skillPoints || 0) + bonusPoints

    if (!employee.growthHistory) employee.growthHistory = []
    employee.growthHistory.push({
        turn: game.turn,
        event: '昇進',
        description: `${oldPosition.emoji} ${oldPosition.name} から ${newPosition.emoji} ${newPosition.name} へ昇進！ | スキルポイント+${bonusPoints}`
    })

    updateDisplay()
    renderActivePanel()
    closeModal()

    const html = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
            <h2 style="color: #667eea; margin-bottom: 12px;">昇進おめでとうございます!</h2>
            <p style="font-size: 18px; margin-bottom: 8px;">${escapeHtml(employee.name)}</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                ${oldPosition.emoji} ${oldPosition.name} → ${newPosition.emoji} ${newPosition.name}
            </p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px; margin-top: 16px;">
                <div>💰 新しい給与: ${Math.floor(employee.salary / 10000)}万円</div>
                ${newPosition.canManage ? `<div style="margin-top: 8px;">👥 管理可能人数: ${newPosition.canManage}名</div>` : ''}
                ${bonusPoints > 0 ? `<div style="margin-top: 8px; color: #667eea; font-weight: 600;">🌳 スキルポイント+${bonusPoints}獲得!</div>` : ''}
            </div>
        </div>
    `
    showModal('', html, true)
}

function unlockSkill(employeeId: number, category: string, skillId: string) {
    if (!requireCompanyActive()) return

    const employee = game.employees.find((e: any) => e.id === employeeId)
    if (!employee) {
        showModal('エラー', '従業員が見つかりません')
        return
    }

    const skill = SKILL_TREE[category]?.skills[skillId]
    if (!skill) {
        showModal('エラー', 'スキルが見つかりません')
        return
    }

    if (!canUnlockSkill(employee, category, skillId)) {
        let reason = ''
        if (employee.unlockedSkills.includes(skillId)) {
            reason = '既に獲得済みです'
        } else if (employee.skillPoints < skill.cost) {
            reason = `スキルポイントが不足しています (必要: ${skill.cost}, 現在: ${employee.skillPoints})`
        } else {
            reason = '前提スキルを先に獲得してください'
        }
        showModal('スキル獲得不可', reason)
        return
    }

    employee.skillPoints -= skill.cost
    employee.unlockedSkills.push(skillId)

    if (skill.effect) {
        Object.keys(skill.effect).forEach(abilityKey => {
            if (employee.abilities[abilityKey] !== undefined) {
                employee.abilities[abilityKey] = Math.min(100, employee.abilities[abilityKey] + skill.effect[abilityKey])
            }
        })
    }

    if (!employee.growthHistory) employee.growthHistory = []
    const effectText = Object.entries(skill.effect || {})
        .map(([key, value]) => `${key}+${value}`)
        .join(', ')
    employee.growthHistory.push({
        turn: game.turn,
        event: 'スキル獲得',
        description: `${skill.icon} ${skill.name} を習得！ (${effectText})`
    })

    updateDisplay()
    renderActivePanel()

    const specialEffect = skill.special ? SKILL_EFFECTS[skill.special] : null
    const html = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">${skill.icon}</div>
            <h2 style="color: #667eea; margin-bottom: 12px;">スキル習得!</h2>
            <p style="font-size: 18px; margin-bottom: 8px;">${escapeHtml(employee.name)}</p>
            <p style="font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 12px;">
                ${skill.name}
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                ${skill.description}
            </p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px; margin-top: 16px;">
                <div style="font-weight: 600; margin-bottom: 8px;">📈 効果</div>
                ${Object.entries(skill.effect || {}).map(([key, value]) =>
                    `<div>${key}: +${value}</div>`
                ).join('')}
                ${specialEffect ? `<div style="margin-top: 8px; color: #f093fb; font-weight: 600;">✨ ${specialEffect.description}</div>` : ''}
            </div>
            <div style="margin-top: 12px; font-size: 14px; color: #999;">
                残りスキルポイント: ${employee.skillPoints}
            </div>
        </div>
    `
    showModal('', html, true)

    setTimeout(() => {
        showSkillTreeModal(employee)
    }, 100)
}

function executeTraining(focusType: string) {
    closeModal()

    const cost = 300000 * game.employees.length
    game.money -= cost

    let bonusMessages: string[] = []
    let growthDetails: { name: string; growth: number }[] = []

    game.employees.forEach((emp: any) => {
        let baseIncrease = 10

        if (emp.subTraits && emp.subTraits.includes('fast_learner')) {
            baseIncrease = Math.floor(baseIncrease * 1.5)
            bonusMessages.push(`${emp.name}は早習得で効果アップ！`)
        }

        if (emp.personalityKey === 'researcher') {
            baseIncrease = Math.floor(baseIncrease * 1.3)
            bonusMessages.push(`${emp.name}は研究者気質で効果アップ！`)
        }

        const focusMap: Record<string, Record<string, number>> = {
            'balanced': { technical: 1.0, sales: 1.0, planning: 1.0, management: 1.0 },
            'technical': { technical: 1.5, sales: 0.5, planning: 0.5, management: 0.5 },
            'sales': { technical: 0.5, sales: 1.5, planning: 0.5, management: 0.5 },
            'planning': { technical: 0.5, sales: 0.5, planning: 1.5, management: 0.5 },
            'management': { technical: 0.5, sales: 0.5, planning: 0.5, management: 1.5 }
        }

        const focusMultipliers = focusMap[focusType] || focusMap['balanced']

        let totalGrowth = 0
        Object.keys(emp.abilities).forEach(key => {
            const currentAbility = emp.abilities[key]
            const growthMultiplier = calculateGrowthMultiplier(currentAbility)
            const focusMultiplier = focusMultipliers[key] || 1.0
            const actualIncrease = Math.max(1, Math.floor(baseIncrease * growthMultiplier * focusMultiplier))

            emp.abilities[key] = Math.min(100, currentAbility + actualIncrease)
            totalGrowth += actualIncrease
        })

        const avgGrowth = Math.floor(totalGrowth / 4)

        const earnedPoints = Math.max(1, Math.floor(avgGrowth / 3))
        emp.skillPoints = (emp.skillPoints || 0) + earnedPoints

        const focusNames: Record<string, string> = {
            'balanced': 'バランス型', 'technical': '技術力特化',
            'sales': '営業力特化', 'planning': '企画力特化', 'management': '管理力特化'
        }
        if (!emp.growthHistory) emp.growthHistory = []
        emp.growthHistory.push({
            turn: game.turn,
            event: `研修（${focusNames[focusType] || 'バランス型'}）`,
            description: `研修を受けて平均+${avgGrowth}上昇 | スキルポイント+${earnedPoints}`
        })

        if (earnedPoints > 0) {
            bonusMessages.push(`${emp.name}はスキルポイント+${earnedPoints}を獲得！`)
        }

        growthDetails.push({ name: emp.name, growth: avgGrowth })
    })

    updateDisplay()
    renderActivePanel()

    const focusNames: Record<string, string> = {
        'balanced': 'バランス型', 'technical': '技術力特化',
        'sales': '営業力特化', 'planning': '企画力特化', 'management': '管理力特化'
    }
    let message = `📚 ${focusNames[focusType] || 'バランス型'}研修を実施しました！<br><br>`
    message += '<div style="font-size: 13px; line-height: 1.6;">'
    growthDetails.forEach(detail => {
        message += `<div>✨ ${escapeHtml(detail.name)}: 平均 +${detail.growth}</div>`
    })
    message += '</div>'

    if (bonusMessages.length > 0) {
        message += '<br><strong>🌟 ボーナス効果:</strong><br>' + bonusMessages.join('<br>')
    }

    message += '<br><br><small style="color: #666;">💡 高能力者は成長が鈍化します (70+: 60%, 80+: 40%, 90+: 20%)</small>'

    showModal('📚 研修完了', message, true)
}

function developProduct() {
    if (!requireCompanyActive()) return
    if (game.employees.length < 2) {
        showModal('開発失敗', '最低2名の従業員が必要です')
        return
    }
    if (game.money < 2000000) {
        showModal('開発失敗', '資金不足です（200万円必要）')
        return
    }
    game.money -= 2000000

    const teamCompatibility = calculateTeamCompatibility(game.employees)
    const avgTech = game.employees.reduce((sum: number, emp: any) => sum + emp.abilities.technical, 0) / game.employees.length

    let qualityMultiplier = 1.0
    let bonusMessages: string[] = []

    const perfectionists = game.employees.filter((emp: any) => emp.personalityKey === 'perfectionist')
    if (perfectionists.length > 0) {
        qualityMultiplier *= 1.2
        bonusMessages.push(`完璧主義者がいて品質アップ！`)
    }

    const geniuses = game.employees.filter((emp: any) => emp.personalityKey === 'lone_genius')
    if (geniuses.length > 0) {
        qualityMultiplier *= 1.4
        bonusMessages.push(`孤高の天才の力で大幅品質アップ！`)
    }

    const architects = game.employees.filter((emp: any) => emp.subTraits && emp.subTraits.includes('architect'))
    if (architects.length > 0) {
        qualityMultiplier *= 1.5
        bonusMessages.push(`アーキテクトの設計力で品質向上！`)
    }

    qualityMultiplier *= teamCompatibility

    const baseQuality = Math.floor(50 + (avgTech / 2) + Math.random() * 20)
    const quality = Math.min(100, Math.floor(baseQuality * qualityMultiplier))

    const product = {
        id: Date.now(),
        name: `製品${game.products.length + 1}`,
        quality: quality,
        sales: 0
    }
    game.products.push(product)
    updateDisplay()
    renderActivePanel()

    let message = `${product.name}を開発しました！<br>品質: ${quality}%`
    if (bonusMessages.length > 0) {
        message += '<br><br><strong>ボーナス効果:</strong><br>' + bonusMessages.join('<br>')
    }
    if (teamCompatibility !== 1.0) {
        message += `<br>チーム相性: ${(teamCompatibility * 100).toFixed(0)}%`
    }
    showModal('🔧 開発成功', message, true)

    advanceTutorialByAction('develop_product')
}

function executeMarketing(strategy: string) {
    closeModal()

    const cost = 1000000
    game.money -= cost

    const strategies: Record<string, { share: number; brand: number; name: string }> = {
        'balanced': { share: 0.3, brand: 1.0, name: 'バランス型' },
        'brand': { share: 0.2, brand: 2.0, name: 'ブランド重視' },
        'share': { share: 0.5, brand: 0.5, name: 'シェア拡大重視' },
        'niche': { share: 0.1, brand: 1.5, name: 'ニッチ戦略' },
        'lowprice': { share: 0.6, brand: -0.3, name: '低価格戦略' }
    }

    const selected = strategies[strategy] || strategies['balanced']

    game.marketShare = Math.min(15, game.marketShare + selected.share)
    game.brandPower = Math.max(0, Math.min(5, game.brandPower + selected.brand))

    updateDisplay()
    renderActivePanel()
    updateRanking()

    let message = `📢 ${selected.name}キャンペーンを実施しました！<br><br>`
    message += `📊 市場シェア: +${selected.share}% → ${game.marketShare.toFixed(2)}%<br>`
    message += `✨ ブランド力: ${selected.brand >= 0 ? '+' : ''}${selected.brand} → ${game.brandPower.toFixed(1)}`

    showModal('📢 マーケティング完了', message, true)
}

function getLoan() {
    if (!requireCompanyActive()) return
    game.money += GAME_CONSTANTS.LOAN_AMOUNT
    game.debt += GAME_CONSTANTS.LOAN_AMOUNT
    updateDisplay()
    renderActivePanel()
    showModal('🏦 融資実行', `500万円の融資を受けました<br>利率: ${(GAME_CONSTANTS.LOAN_INTEREST_RATE * 100).toFixed(1)}%/月`, true)
}

function repayLoan() {
    if (!requireCompanyActive()) return
    if (game.debt <= 0) {
        showModal('返済不要', '現在の借入はありません')
        return
    }
    const maxRepay = Math.min(game.debt, game.money)
    if (maxRepay <= 0) {
        showModal('返済失敗', '返済に充てる資金がありません')
        return
    }
    game.money -= maxRepay
    game.debt -= maxRepay
    updateDisplay()
    renderActivePanel()
    showModal('💸 返済完了', `${Math.floor(maxRepay / 10000)}万円を返済しました`)
}

// ============================================
// 社長モード: 操作関数
// ============================================

function openDocument(docId: string) {
    const doc = game.documentQueue.find((d: any) => d.id === docId)
    if (!doc) return
    showModal('📋 書類詳細', renderDocumentDetail(doc, game), true)
}

function verdictDocument(docId: string, verdict: string) {
    const outcome = DocumentManager.processVerdict(game, docId, verdict as DocumentVerdict)
    if (!outcome) return
    const doc = game.documentHistory.find((d: any) => d.id === docId) || game.documentQueue.find((d: any) => d.id === docId)
    if (doc && doc.outcome) {
        showModal('📋 決裁結果', renderVerdictResult(doc), true)
    } else {
        showModal('📋 決裁結果', `<p>${outcome.description}</p>`, true)
    }
    updateDisplay()
    renderActivePanel()
}

function respondToVisitor(eventId: string, responseId: string) {
    const result = VisitorManager.processResponse(game, eventId, responseId)
    if (!result) return
    const event = game.visitorHistory[game.visitorHistory.length - 1]
    if (event) {
        showModal('🚪 訪問者対応完了', renderVisitorResult(event, result.effects), true)
    }
    updateDisplay()
    renderActivePanel()
}

function switchDeskTab(tabName: string) {
    document.querySelectorAll('.desk-tab').forEach(t => t.classList.remove('active'))
    const activeTab = document.querySelector(`.desk-tab[onclick="switchDeskTab('${tabName}')"]`)
    if (activeTab) activeTab.classList.add('active')

    const content = document.getElementById('deskTabContent')
    if (!content) return

    switch (tabName) {
        case 'documents':
            content.innerHTML = renderDocumentStack(game)
            break
        case 'status':
            content.innerHTML = renderStatusTab(game)
            break
        case 'employees':
            content.innerHTML = renderEmployeesForDesk(game)
            break
        case 'directives':
            content.innerHTML = renderDirectivePanel(game)
            break
    }
}

function issueDirectiveAction(department: string, type: string) {
    CEOManager.issueDirective(game, department, type)
    showModal('📢 指示完了', `${department === 'development' ? '開発' : department === 'sales' ? '営業' : department === 'planning' ? '企画' : '管理'}部に指示を出しました。次のターンに書類が届きます。`)
}

let _selectedPolicies: PolicyFocus[] = []

function togglePolicyFocus(focus: string) {
    const idx = _selectedPolicies.indexOf(focus as PolicyFocus)
    if (idx >= 0) {
        _selectedPolicies.splice(idx, 1)
    } else if (_selectedPolicies.length < 3) {
        _selectedPolicies.push(focus as PolicyFocus)
    }
    document.querySelectorAll('.policy-option').forEach(el => {
        const policyKey = (el as HTMLElement).dataset.policy
        if (policyKey && _selectedPolicies.includes(policyKey as PolicyFocus)) {
            el.classList.add('selected')
        } else {
            el.classList.remove('selected')
        }
    })
}

function confirmPolicySelection() {
    if (_selectedPolicies.length < 2) {
        showModal('⚠️ 方針選択', '2つ以上の方針を選択してください。')
        return
    }
    CEOManager.setPolicy(game, _selectedPolicies)
    _selectedPolicies = []
    closeModal()
    updateDisplay()
    renderActivePanel()
    showModal('🎯 方針決定', '経営方針が設定されました。方針に沿った書類の承認でボーナスが得られます。')
}

function selectCEOTrait(trait: string) {
    game.ceo = createDefaultCEOStatus(trait as CEOTrait)
    game.gameMode = 'ceo'
    setActivePanel('desk')

    const deskTab = document.querySelector('.tab[data-panel="desk"]') as HTMLElement
    if (deskTab) deskTab.style.display = ''

    const initialDocs = DocumentManager.generateDocuments(game, 3)
    game.documentQueue.push(...initialDocs)

    closeModal()
    showPanel(null, 'desk')
    updateDisplay()
    showModal('🏢 社長就任', `<div style="text-align:center;"><div style="font-size:48px;margin:16px;">🏢</div><p>社長に就任しました！</p><p>デスクに届いた書類を処理し、会社を成長させましょう。</p></div>`, true)
}

// ============================================
// Window バインディング（HTML onclick 互換）
// ============================================

// ゲームデータ
;(window as any).game = game

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

// 人事管理 (Category B wrappers + modals)
;(window as any).showHiring = showHiring
;(window as any).showDepartmentSelectionForHiring = showDepartmentSelectionForHiring
;(window as any).showHiringForDepartment = showHiringForDepartment
;(window as any).hireSelectedCandidate = hireSelectedCandidate
;(window as any).hireEmployee = hireEmployee
;(window as any).trainEmployees = trainEmployees
;(window as any).executeTraining = executeTraining
;(window as any).promoteEmployee = promoteEmployee
;(window as any).showEmployeeDetail = showEmployeeDetail
;(window as any).changeDepartment = changeDepartment
;(window as any).showDepartmentChangeModal = showDepartmentChangeModal

// スキル・性格・特性システム
;(window as any).showSkillTreeModal = showSkillTreeModal
;(window as any).switchSkillCategory = switchSkillCategory
;(window as any).unlockSkill = unlockSkill
;(window as any).showPersonalityDetail = showPersonalityDetail
;(window as any).showTraitDetail = showTraitDetail
;(window as any).canPromote = canPromote
;(window as any).canUnlockSkill = canUnlockSkill

// 製品開発・市場・財務
;(window as any).developProduct = developProduct
;(window as any).doMarketing = doMarketing
;(window as any).executeMarketing = executeMarketing
;(window as any).getLoan = getLoan
;(window as any).repayLoan = repayLoan

// 実績システム
;(window as any).showAllAchievements = showAllAchievements
;(window as any).showAchievementUnlocked = showAchievementUnlocked
;(window as any).checkAchievements = checkAchievements

// チュートリアルシステム
;(window as any).startTutorial = startTutorial
;(window as any).advanceTutorial = advanceTutorial
;(window as any).skipTutorial = skipTutorial
;(window as any).toggleTutorial = toggleTutorial
;(window as any).advanceTutorialByAction = advanceTutorialByAction

// 内部関数（他モジュールが (window as any) 経由で使用）
;(window as any).updateDisplay = updateDisplay
;(window as any).renderActivePanel = renderActivePanel
;(window as any).updateControls = updateControls
;(window as any).updateRanking = updateRanking
;(window as any).updateCharts = updateCharts
;(window as any).updateMarketChart = updateMarketChart
;(window as any).initCharts = initCharts
;(window as any).generateNews = generateNews
;(window as any).updateCompetitors = updateCompetitors
;(window as any).renderAchievements = renderAchievements
;(window as any).generateCandidate = generateCandidate
;(window as any).generateCandidateForDepartment = generateCandidateForDepartment
;(window as any).calculateTeamCompatibility = calculateTeamCompatibility
;(window as any).calculateGrowthMultiplier = calculateGrowthMultiplier
;(window as any).escapeHtml = escapeHtml
;(window as any).requireCompanyActive = requireCompanyActive

// ======= 社長モード =======
;(window as any).openDocument = openDocument
;(window as any).verdictDocument = verdictDocument
;(window as any).respondToVisitor = respondToVisitor
;(window as any).switchDeskTab = switchDeskTab
;(window as any).issueDirectiveAction = issueDirectiveAction
;(window as any).togglePolicyFocus = togglePolicyFocus
;(window as any).confirmPolicySelection = confirmPolicySelection
;(window as any).selectCEOTrait = selectCEOTrait

console.log('[game.ts] Phase 2: All modules loaded and window bindings active (CEO mode included)')
