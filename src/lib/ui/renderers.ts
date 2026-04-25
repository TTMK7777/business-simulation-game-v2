// ビジネスエンパイア 2.0 - パネル描画モジュール
// game.ts:1046-1153, 1849-1865, 1867-2396 から抽出

import { html as litHtml, render as litRender, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { getGame, getActivePanel, setActivePanel, getCompetitors } from '../store/gameStore'
import { renderDeskView } from './deskView'
import { PERSONALITIES, SUB_TRAITS, HIDDEN_TRAITS } from '../config/personalities'
import { DEPARTMENTS, POSITIONS } from '../config/departments'
import { OFFICE_LEVELS } from '../config/offices'
import { calculateTeamCompatibility } from '../managers/HRManager'
import {
    ACHIEVEMENTS,
    ACHIEVEMENT_RARITIES,
    DIFFICULTY_SETTINGS,
    COMPETITOR_STRATEGIES,
    COMPETITOR_ACTIONS,
} from '../gameConfig'

// ============================================
// 実績パネル描画
// ============================================

// 実績一覧を取得（レンダリング用）
function getAchievementsList() {
    const game = getGame()
    return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: (game.unlockedAchievements || []).includes(achievement.id),
        rarity: ACHIEVEMENT_RARITIES[achievement.rarity],
        category: achievement.category
    }))
}

// 実績進捗を取得
function getAchievementProgress() {
    const game = getGame()
    const unlocked = (game.unlockedAchievements || []).length
    const total = ACHIEVEMENTS.filter(achievement => {
        return achievement && !achievement.hidden
    }).length
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) }
}

// 実績パネルをレンダリング（Lit html — 自動エスケープ）
export function renderAchievements(): void {
    const game = getGame()
    const achievementDisplay = document.getElementById('achievementDisplay')
    if (!achievementDisplay) return

    const progress = getAchievementProgress()
    const recentUnlocked = (game.unlockedAchievements || [])
        .slice(-5)
        .reverse()
        .map((id: string) => ACHIEVEMENTS.find(a => a.id === id))
        .filter(Boolean)

    const template = litHtml`
        <div class="achievement-header">
            <h4 style="margin: 0; font-size: 14px;">🏆 実績</h4>
            <span class="achievement-progress">${progress.unlocked}/${progress.total}</span>
        </div>
        <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width: ${progress.percentage}%"></div>
        </div>
        <div class="achievement-list">
            ${recentUnlocked.length > 0 ? recentUnlocked.map((ach: any) => {
                const rarity = ACHIEVEMENT_RARITIES[ach!.rarity as keyof typeof ACHIEVEMENT_RARITIES]
                return litHtml`
                    <div class="achievement-badge" style="background: ${rarity.bgColor}; border: 2px solid ${rarity.color};"
                         title="${ach!.name}: ${ach!.description}">
                        <span class="achievement-emoji">${ach!.emoji}</span>
                    </div>
                `
            }) : litHtml`
                <div style="color: #999; font-size: 12px; text-align: center; width: 100%;">
                    まだ実績がありません
                </div>
            `}
        </div>
        <button class="btn-small" @click=${showAllAchievements} style="margin-top: 8px; width: 100%;">
            すべての実績を見る
        </button>
    `

    litRender(template, achievementDisplay)
}

// 全実績モーダルを表示
export function showAllAchievements(): void {
    const achievements = getAchievementsList()
    const progress = getAchievementProgress()

    // カテゴリ別にグループ化
    const categories: Record<string, { name: string; achievements: typeof achievements }> = {
        money: { name: '💰 資金系', achievements: [] },
        employees: { name: '👥 従業員系', achievements: [] },
        products: { name: '📦 製品系', achievements: [] },
        market: { name: '📊 市場系', achievements: [] },
        special: { name: '✨ 特殊系', achievements: [] }
    }

    achievements.forEach(ach => {
        if (!ach.hidden || ach.unlocked) {
            categories[ach.category].achievements.push(ach)
        }
    })

    let html = `
        <div style="margin-bottom: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🏆 実績コレクション</div>
            <div style="font-size: 14px; color: #666;">
                解除済み: <strong>${progress.unlocked}</strong> / ${progress.total}
                (<strong>${progress.percentage}%</strong>)
            </div>
            <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-top: 8px;">
                <div style="width: ${progress.percentage}%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;"></div>
            </div>
        </div>
    `

    Object.entries(categories).forEach(([, category]) => {
        if (category.achievements.length === 0) return

        html += `
            <div style="margin-bottom: 16px;">
                <div style="font-weight: bold; margin-bottom: 8px;">${category.name}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    ${category.achievements.map(ach => {
                        const opacity = ach.unlocked ? '1' : '0.4'
                        const filter = ach.unlocked ? 'none' : 'grayscale(100%)'
                        return `
                            <div style="background: ${ach.rarity.bgColor}; padding: 12px; border-radius: 12px;
                                        border: 2px solid ${ach.unlocked ? ach.rarity.color : '#ddd'}; opacity: ${opacity}; filter: ${filter};">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 24px;">${ach.emoji}</span>
                                    <div>
                                        <div style="font-weight: bold; font-size: 13px;">${ach.name}</div>
                                        <div style="font-size: 11px; color: ${ach.rarity.color};">${ach.rarity.name}</div>
                                    </div>
                                </div>
                                <div style="font-size: 11px; color: #666; margin-top: 6px;">
                                    ${ach.unlocked ? ach.description : (ach.hidden ? '???' : ach.description)}
                                </div>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        `
    })

    // TODO: 接続 - showModal は game.ts から直接呼び出し中
    // Phase 2 で modals.ts の showModal を import して使用
    (window as any).showModal('🏆 実績一覧', html, true)
}

// ============================================
// 競合攻撃通知
// ============================================

export function showCompetitorAttackNotification(
    comp: any,
    action: typeof COMPETITOR_ACTIONS[keyof typeof COMPETITOR_ACTIONS],
    targetName?: string
): void {
    let message = action.description.replace('${company}', comp.name)
    if (targetName) {
        message += `\n対象: ${targetName}さん`
    }

    document.getElementById('newsText')!.textContent = `${action.emoji} ${message}`
    // competitorAttacks への追加は MarketManager.executeCompetitorAction() で実施済み
}

// ============================================
// ランキングバー更新
// ============================================

export function updateRanking(): void {
    const game = getGame()
    const competitors = getCompetitors()

    const allCompanies = [
        ...competitors.map(c => ({ name: c.name, share: c.share ?? c.initialShare, isPlayer: false })),
        { name: 'あなた', share: game.marketShare, isPlayer: true }
    ].sort((a, b) => b.share - a.share)

    const rankingBar = document.getElementById('rankingBar')
    if (!rankingBar) return

    const medals = ['🥇', '🥈', '🥉', '4']
    const template = litHtml`
        ${allCompanies.slice(0, 4).map((company, index) => litHtml`
            <div class="rank-item ${company.isPlayer ? 'player' : ''}">
                <span class="rank-medal">${medals[index]}</span>
                ${company.name}<br>(${company.share.toFixed(1)}%)
            </div>
        `)}
    `
    litRender(template, rankingBar)
}

// ============================================
// タブ切り替え
// ============================================

const MANAGEMENT_TABS = ['overview', 'employees', 'departments', 'products', 'market', 'finance', 'certifications']

/**
 * ゲームモードに応じてタブの表示を切り替える。
 * - 'ceo': 通常タブ非表示、deskタブのみ表示
 * - 'management': 通常タブ表示、deskタブ非表示
 */
export function applyTabVisibilityForMode(mode: 'management' | 'ceo'): void {
    const isCEO = mode === 'ceo'
    MANAGEMENT_TABS.forEach(panel => {
        const tab = document.querySelector(`.tab[data-panel="${panel}"]`) as HTMLElement | null
        if (tab) tab.style.display = isCEO ? 'none' : ''
    })
    const deskTab = document.querySelector('.tab[data-panel="desk"]') as HTMLElement | null
    if (deskTab) deskTab.style.display = isCEO ? '' : 'none'
}

export function showPanel(tabButton: any, panelId?: string): void {
    const game = getGame()
    let resolvedPanelId = panelId || 'overview'
    let resolvedTab = tabButton

    // CEOモード中は desk 以外の通常タブをブロックして desk にリダイレクト
    if (game.gameMode === 'ceo' && resolvedPanelId !== 'desk') {
        resolvedPanelId = 'desk'
        resolvedTab = document.querySelector(`.tab[data-panel="desk"]`)
    } else if (!resolvedTab) {
        resolvedTab = document.querySelector(`.tab[data-panel="${resolvedPanelId}"]`)
    }

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'))
    if (resolvedTab) {
        resolvedTab.classList.add('active')
    }
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'))
    const panelElement = document.getElementById(resolvedPanelId)
    if (panelElement) {
        panelElement.classList.add('active')
    }
    setActivePanel(resolvedPanelId)
    renderActivePanel()
}

// ============================================
// オフィスレベル表示
// ============================================

export function renderOfficeDisplay(): void {
    const game = getGame()
    const officeDisplayEl = document.getElementById('officeDisplay')
    if (!officeDisplayEl) return

    const office = OFFICE_LEVELS[game.officeLevel]
    const nextOffice = OFFICE_LEVELS[game.officeLevel + 1]

    const levelColors: Record<number, { primary: string; gradient: string }> = {
        1: { primary: '#6c757d', gradient: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' },
        2: { primary: '#28a745', gradient: 'linear-gradient(135deg, #28a745 0%, #218838 100%)' },
        3: { primary: '#007bff', gradient: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' },
        4: { primary: '#6f42c1', gradient: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)' },
        5: { primary: '#fd7e14', gradient: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)' }
    }
    const levelColor = levelColors[game.officeLevel] || levelColors[1]

    let progressPercent = 0
    let employeeProgress = 0, moneyProgress = 0, shareProgress = 0

    if (nextOffice) {
        employeeProgress = Math.min(100, (game.employees.length / nextOffice.unlockConditions.employees) * 100)
        moneyProgress = Math.min(100, (game.money / nextOffice.unlockConditions.money) * 100)
        shareProgress = Math.min(100, (game.marketShare / nextOffice.unlockConditions.marketShare) * 100)
        progressPercent = (employeeProgress + moneyProgress + shareProgress) / 3
    } else {
        progressPercent = 100
    }

    const template = litHtml`
        <div class="office-display enhanced">
            <div class="office-header" style="background: ${levelColor.gradient};">
                <div class="office-level-badge-new">Lv.${game.officeLevel}</div>
                <div class="office-icon-large">${office.emoji}</div>
                <div class="office-name-large">${office.name}</div>
            </div>

            <div class="office-evolution-line">
                ${Object.keys(OFFICE_LEVELS).map((level, index) => {
                    const lvl = parseInt(level)
                    const isActive = lvl <= game.officeLevel
                    const isCurrent = lvl === game.officeLevel
                    return litHtml`
                        ${index > 0 ? litHtml`<div class="evolution-connector"></div>` : nothing}
                        <div class="office-evolution-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                            <div class="evolution-emoji">${OFFICE_LEVELS[lvl].emoji}</div>
                            ${isCurrent ? litHtml`<div class="current-indicator">▲</div>` : nothing}
                        </div>
                    `
                })}
            </div>

            <div class="office-body">
                <div class="office-description-box">
                    <span class="description-icon">📍</span>
                    ${office.description}
                </div>

                ${nextOffice ? litHtml`
                    <div class="next-level-section">
                        <div class="next-level-header">
                            <span>${nextOffice.emoji}</span>
                            <span>次のレベル: <strong>${nextOffice.name}</strong></span>
                        </div>

                        <div class="condition-progress-list">
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>👥 従業員</span>
                                    <span class="${employeeProgress >= 100 ? 'complete' : ''}">${game.employees.length} / ${nextOffice.unlockConditions.employees}</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${employeeProgress}%; background: #28a745;"></div>
                                </div>
                            </div>
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>💰 資金</span>
                                    <span class="${moneyProgress >= 100 ? 'complete' : ''}">${Math.floor(game.money/10000)}万 / ${Math.floor(nextOffice.unlockConditions.money/10000)}万</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${moneyProgress}%; background: #ffc107;"></div>
                                </div>
                            </div>
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>📊 シェア</span>
                                    <span class="${shareProgress >= 100 ? 'complete' : ''}">${game.marketShare.toFixed(1)}% / ${nextOffice.unlockConditions.marketShare}%</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${shareProgress}%; background: #007bff;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="total-progress">
                            <div class="total-progress-label">総合進捗: <strong>${Math.floor(progressPercent)}%</strong></div>
                            <div class="total-progress-bar">
                                <div class="total-progress-fill" style="width: ${progressPercent}%;"></div>
                            </div>
                        </div>
                    </div>
                ` : litHtml`
                    <div class="max-level-banner">
                        <div class="max-level-icon">🏆</div>
                        <div class="max-level-text">最高レベル達成！</div>
                        <div class="max-level-sub">業界を制覇しました</div>
                    </div>
                `}

                <div class="office-capacity">
                    <div class="capacity-header">オフィス収容人数</div>
                    <div class="capacity-visual">
                        ${Array(Math.ceil(office.maxEmployees / 10)).fill(0).map((_: any, i: number) => {
                            const filled = Math.min(10, game.employees.length - i * 10)
                            const total = Math.min(10, office.maxEmployees - i * 10)
                            return litHtml`<div class="capacity-row">
                                ${Array(total).fill(0).map((_: any, j: number) =>
                                    litHtml`<span class="capacity-dot ${j < filled ? 'filled' : ''}">●</span>`
                                )}
                            </div>`
                        })}
                    </div>
                    <div class="capacity-text">${game.employees.length} / ${office.maxEmployees} 名</div>
                </div>
            </div>
        </div>
    `

    litRender(template, officeDisplayEl)
}

// ============================================
// アクティブパネル切り替え
// ============================================

export function renderActivePanel(): void {
    const game = getGame()
    let activePanel = getActivePanel()

    // CEOモード中に desk 以外がアクティブになった場合のフォールバック保護
    if (game.gameMode === 'ceo' && activePanel !== 'desk') {
        setActivePanel('desk')
        activePanel = 'desk'
    }

    if (activePanel === 'overview') {
        renderOfficeDisplay()
        renderAchievements()
    } else if (activePanel === 'employees') {
        renderEmployees()
    } else if (activePanel === 'departments') {
        renderDepartments()
    } else if (activePanel === 'products') {
        renderProducts()
    } else if (activePanel === 'market') {
        renderMarket()
        // TODO: 接続 - updateMarketChart は charts.integration.ts に移動予定
        if (typeof (window as any).updateMarketChart === 'function') {
            (window as any).updateMarketChart()
        }
    } else if (activePanel === 'finance') {
        renderFinance()
    } else if (activePanel === 'desk') {
        // ======= 社長モード: デスクビュー =======
        const deskPanel = document.getElementById('desk')
        if (deskPanel) {
            litRender(litHtml`${unsafeHTML(renderDeskView(getGame()))}`, deskPanel)
        }
    }
}

// ============================================
// 全画面更新
// ============================================

export function updateDisplay(): void {
    const game = getGame()

    const moneyEl = document.getElementById('money')
    if (moneyEl) moneyEl.textContent = `${Math.floor(game.money / 10000)}万`

    const empCountEl = document.getElementById('employeeCount')
    if (empCountEl) empCountEl.textContent = String(game.employees.length)

    const revenueEl = document.getElementById('revenue')
    if (revenueEl) revenueEl.textContent = `${Math.floor(game.monthlyRevenue / 10000)}万`

    const dateEl = document.getElementById('gameDate')
    if (dateEl) dateEl.textContent = `${game.year}年${game.month}月 第${game.week}週`

    const shareEl = document.getElementById('marketShare')
    if (shareEl) shareEl.textContent = `${game.marketShare.toFixed(1)}%`

    const brandCount = Math.max(0, Math.min(5, Math.floor(game.brandPower)))
    const brandEl = document.getElementById('brand')
    if (brandEl) brandEl.textContent = brandCount > 0 ? '⭐'.repeat(brandCount) : '―'

    // プログレスバー更新
    const moneyPercent = Math.min(100, (game.money / 20000000) * 100)
    const moneyProgressEl = document.getElementById('moneyProgress') as HTMLElement
    if (moneyProgressEl) moneyProgressEl.style.width = moneyPercent + '%'

    const revenuePercent = Math.min(100, (game.monthlyRevenue / 10000000) * 100)
    const revenueProgressEl = document.getElementById('revenueProgress') as HTMLElement
    if (revenueProgressEl) revenueProgressEl.style.width = revenuePercent + '%'

    updateControls()
    // TODO: 接続 - updateCharts は charts.integration.ts に移動予定
    if (typeof (window as any).updateCharts === 'function') {
        (window as any).updateCharts()
    }
}

export function updateControls(): void {
    const game = getGame()
    const disabled = game.isBankrupt
    document.querySelectorAll('[data-requires-active="true"]').forEach((btn: any) => {
        btn.disabled = disabled
    })
    const restartBtn = document.getElementById('restartButton') as HTMLElement
    if (restartBtn) {
        restartBtn.style.display = disabled ? 'block' : 'none'
    }
}

// ============================================
// 従業員一覧パネル
// ============================================

export function renderEmployees(): void {
    const game = getGame()
    const list = document.getElementById('employeeList')
    if (!list) return

    if (game.employees.length === 0) {
        litRender(litHtml`<div class="empty">従業員がいません</div>`, list)
        return
    }

    const teamCompatibility = calculateTeamCompatibility(game.employees)

    const template = litHtml`
        ${game.employees.length > 1 ? litHtml`
            <div class="info-box" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">🤝 チーム相性</span>
                    <span style="font-weight: bold; color: ${teamCompatibility >= 1.0 ? '#4caf50' : '#ff9800'};">
                        ${(teamCompatibility * 100).toFixed(0)}%
                    </span>
                </div>
            </div>
        ` : nothing}
        ${game.employees.map((emp: any, empIndex: number) => {
            const personality = PERSONALITIES[emp.personalityKey] || PERSONALITIES.logical
            return litHtml`
                <div class="employee" @click=${() => (window as any).showEmployeeDetail(game.employees[empIndex])}>
                    <div class="employee-header">
                        <div class="employee-name">
                            <span class="icon-badge">👤</span>
                            ${emp.name}
                        </div>
                        <span class="personality">${personality.emoji} ${personality.name}</span>
                    </div>
                    <div style="margin: 8px 0; display: flex; gap: 6px; flex-wrap: wrap;">
                        <span class="department-badge">${DEPARTMENTS[emp.department]?.emoji || '💻'} ${DEPARTMENTS[emp.department]?.name || '開発部'}</span>
                        <span class="position-badge">${POSITIONS[emp.position]?.emoji || '👤'} ${POSITIONS[emp.position]?.name || 'スタッフ'}</span>
                    </div>
                    ${emp.subTraits && emp.subTraits.length > 0 ? litHtml`
                        <div style="margin: 12px 0; display: flex; flex-wrap: wrap; gap: 6px;">
                            ${emp.subTraits.map((traitKey: string) => {
                                const trait = SUB_TRAITS[traitKey]
                                if (!trait) return nothing
                                return litHtml`<span style="background: ${trait.negative ? 'rgba(244, 67, 54, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
                                               color: ${trait.negative ? '#f44336' : '#4caf50'};
                                               padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                    ${trait.emoji} ${trait.name}
                                </span>`
                            })}
                        </div>
                    ` : nothing}
                    ${emp.hiddenTraitRevealed ? litHtml`
                        <div style="margin: 8px 0;">
                            <span style="background: linear-gradient(135deg, #ffd700, #ffed4e);
                                   padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #333;">
                                ✨ ${HIDDEN_TRAITS[emp.hiddenTrait].emoji} ${HIDDEN_TRAITS[emp.hiddenTrait].name}
                            </span>
                        </div>
                    ` : nothing}
                    <div class="abilities">
                        <div class="ability">
                            <span class="ability-name">⚙️ 技術: ${emp.abilities.technical}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${emp.abilities.technical}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">💼 営業: ${emp.abilities.sales}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${emp.abilities.sales}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">📋 企画: ${emp.abilities.planning}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${emp.abilities.planning}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">👔 管理: ${emp.abilities.management}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${emp.abilities.management}%"></div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 8px; color: #667eea; font-weight: 600;">💰 月給: ${Math.floor(emp.salary / 10000)}万円</div>
                </div>
            `
        })}
    `

    litRender(template, list)
}

// ============================================
// 製品パネル
// ============================================

export function renderProducts(): void {
    const game = getGame()
    const list = document.getElementById('productList')
    if (!list) return

    if (game.products.length === 0) {
        litRender(litHtml`<div class="empty">製品がありません<br>💡 新製品を開発しましょう!</div>`, list)
        return
    }
    litRender(litHtml`${game.products.map((product: any) => litHtml`
        <div class="product">
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">📦 ${product.name}</div>
            <div class="product-quality">⭐ 品質: ${product.quality}%</div>
            <div style="margin-top: 8px; font-weight: 600;">💵 累計売上: ${Math.floor(product.sales / 10000)}万円</div>
        </div>
    `)}`, list)
}

// ============================================
// 市場パネル（競合企業表示）
// ============================================

export function renderMarket(): void {
    const game = getGame()
    const competitors = getCompetitors()
    const info = document.getElementById('marketInfo')
    if (!info) return

    const difficultyConfig = DIFFICULTY_SETTINGS[(game.difficulty || 'normal') as keyof typeof DIFFICULTY_SETTINGS]

    const template = litHtml`
        <div style="background: linear-gradient(135deg, #f8f9ff, #e8ecff); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">${difficultyConfig.emoji}</span>
                <span style="font-weight: bold; color: #667eea;">難易度: ${difficultyConfig.name}</span>
            </div>
            <div style="font-size: 12px; color: #666;">${difficultyConfig.description}</div>
        </div>

        <h4 style="margin-top: 20px; margin-bottom: 12px; color: #667eea;">🏆 競合企業</h4>
        ${competitors.map(comp => {
            const share = comp.share ?? comp.initialShare
            const strategyConfig = COMPETITOR_STRATEGIES[comp.strategy]
            const alertColor = comp.alertLevel > 70 ? '#f44336' : comp.alertLevel > 40 ? '#ff9800' : '#4caf50'

            return litHtml`
            <div class="competitor" style="border-left: 4px solid ${comp.color}; padding: 12px; margin-bottom: 16px; background: #f9f9f9; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 15px;">🏢 ${comp.name}</strong>
                    <span style="font-size: 12px; background: ${alertColor}; color: white; padding: 2px 8px; border-radius: 10px;">
                        警戒: ${Math.floor(comp.alertLevel)}%
                    </span>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 20px;">${comp.ceo.emoji}</span>
                    <div>
                        <div style="font-size: 13px; font-weight: bold;">${comp.ceo.name}</div>
                        <div style="font-size: 11px; color: #666; font-style: italic;">"${comp.ceo.quote}"</div>
                    </div>
                </div>
                <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                    <div>📊 シェア: <strong>${share.toFixed(1)}%</strong></div>
                    <div>💪 パワー: <strong>${comp.power}</strong></div>
                    <div>${strategyConfig.emoji} ${strategyConfig.name}</div>
                    <div>🎯 ${comp.speciality}</div>
                </div>
                ${comp.lastAction ? litHtml`
                    <div style="margin-top: 8px; font-size: 12px; color: #e74c3c; background: #fff5f5; padding: 6px 10px; border-radius: 6px;">
                        ⚠️ 最近の動き: ${COMPETITOR_ACTIONS[comp.lastAction as keyof typeof COMPETITOR_ACTIONS]?.name || comp.lastAction}
                    </div>
                ` : nothing}
            </div>
        `})}

        ${game.competitorAttacks && game.competitorAttacks.length > 0 ? litHtml`
            <h4 style="margin-top: 20px; margin-bottom: 12px; color: #e74c3c;">⚔️ 最近の競合動向</h4>
            <div style="background: #fff5f5; padding: 12px; border-radius: 8px; font-size: 13px;">
                ${game.competitorAttacks.map((attack: string) => litHtml`<div style="margin-bottom: 4px;">• ${attack}</div>`)}
            </div>
        ` : nothing}
    `
    litRender(template, info)
}

// ============================================
// 財務パネル
// ============================================

const LOAN_INTEREST_RATE = 0.02

export function renderFinance(): void {
    const game = getGame()
    const info = document.getElementById('financeInfo')
    if (!info) return

    const salaryTotal = game.employees.reduce((sum: number, emp: any) => sum + emp.salary, 0)
    const interestPreview = game.debt > 0 ? Math.floor(game.debt * LOAN_INTEREST_RATE) : 0
    const template = litHtml`
        <div class="info-box">
            <div>
                <span>📊 売上高</span>
                <strong>${Math.floor(game.monthlyRevenue / 10000)}万円</strong>
            </div>
            <div>
                <span>👥 人件費</span>
                <strong>${Math.floor(salaryTotal / 10000)}万円</strong>
            </div>
            <div style="border-top: 2px solid #667eea; padding-top: 8px; margin-top: 8px;">
                <span>💰 純利益</span>
                <strong style="color: ${(game.monthlyRevenue - salaryTotal - interestPreview) >= 0 ? '#4caf50' : '#f44336'}">
                    ${Math.floor((game.monthlyRevenue - salaryTotal - interestPreview) / 10000)}万円
                </strong>
            </div>
            ${game.debt ? litHtml`<div style="margin-top: 8px;">
                <span>🏦 借金残高</span>
                <strong style="color: #ff9800;">${Math.floor(game.debt / 10000)}万円</strong>
            </div>` : nothing}
            ${interestPreview ? litHtml`<div>
                <span>📈 次月利息見込</span>
                <strong>${Math.floor(interestPreview / 10000)}万円</strong>
            </div>` : nothing}
        </div>
    `
    litRender(template, info)
}

// ============================================
// 部署パネル
// ============================================

export function renderDepartments(): void {
    const game = getGame()
    const grid = document.getElementById('departmentsGrid')
    if (!grid) return

    if (game.employees.length === 0) {
        litRender(litHtml`<div class="empty">従業員がまだいません</div>`, grid)
        return
    }

    // 部署ごとの従業員を集計
    const departmentStats: Record<string, any> = {}
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        departmentStats[deptKey] = {
            employees: [],
            totalAbility: 0,
            manager: null
        }
    })

    game.employees.forEach((emp: any) => {
        const deptKey = emp.department || 'development'
        if (departmentStats[deptKey]) {
            departmentStats[deptKey].employees.push(emp)

            const avgAbility = (emp.abilities.technical + emp.abilities.sales +
                               emp.abilities.planning + emp.abilities.management) / 4
            departmentStats[deptKey].totalAbility += avgAbility

            const empPosition = POSITIONS[emp.position]
            const currentManager = departmentStats[deptKey].manager
            if (!currentManager ||
                (empPosition && empPosition.requiredAbility > (POSITIONS[currentManager.position]?.requiredAbility || 0))) {
                departmentStats[deptKey].manager = emp
            }
        }
    })

    const template = litHtml`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            ${Object.keys(DEPARTMENTS).map(deptKey => {
                const dept = DEPARTMENTS[deptKey]
                const stats = departmentStats[deptKey]
                const empCount = stats.employees.length
                const avgAbility = empCount > 0 ? Math.round(stats.totalAbility / empCount) : 0

                const efficiency = Math.min(100, avgAbility * 1.2)
                const efficiencyColor = efficiency >= 80 ? '#4caf50' : efficiency >= 50 ? '#ff9800' : '#f44336'

                return litHtml`
                    <div class="department-card">
                        <div class="department-card-header">
                            <div style="font-size: 32px; margin-bottom: 8px;">${dept.emoji}</div>
                            <div style="font-size: 18px; font-weight: 700; color: #333;">${dept.name}</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px;">${dept.description}</div>
                        </div>

                        <div class="department-stats">
                            <div class="stat-item">
                                <div class="department-stat-label">👥 人数</div>
                                <div class="department-stat-value">${empCount}名</div>
                            </div>
                            <div class="stat-item">
                                <div class="department-stat-label">💪 平均能力</div>
                                <div class="department-stat-value">${avgAbility}</div>
                            </div>
                        </div>

                        <div class="department-manager">
                            <div style="font-size: 12px; font-weight: 600; color: #667eea; margin-bottom: 6px;">👔 責任者</div>
                            ${stats.manager ? litHtml`
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 20px;">${PERSONALITIES[stats.manager.personalityKey]?.emoji || '👤'}</span>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 600;">${stats.manager.name}</div>
                                        <div style="font-size: 11px; color: #999;">
                                            ${POSITIONS[stats.manager.position]?.emoji || '👤'} ${POSITIONS[stats.manager.position]?.name || 'スタッフ'}
                                        </div>
                                    </div>
                                </div>
                            ` : litHtml`<div style="font-size: 12px; color: #999;">未配置</div>`}
                        </div>

                        <div class="department-efficiency">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 12px; font-weight: 600; color: #667eea;">📊 効率性</span>
                                <span style="font-size: 14px; font-weight: 700; color: ${efficiencyColor};">${Math.round(efficiency)}%</span>
                            </div>
                            <div style="background: rgba(0,0,0,0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: ${efficiencyColor}; height: 100%; width: ${efficiency}%;
                                           transition: width 0.3s ease; border-radius: 4px;"></div>
                            </div>
                        </div>

                        ${empCount > 0 ? litHtml`
                            <div class="department-employees">
                                <div style="font-size: 11px; color: #999; margin-bottom: 6px;">所属メンバー</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${stats.employees.slice(0, 8).map((emp: any) =>
                                        litHtml`<span style="font-size: 16px;" title="${emp.name}">
                                            ${PERSONALITIES[emp.personalityKey]?.emoji || '👤'}
                                        </span>`
                                    )}
                                    ${empCount > 8 ? litHtml`<span style="font-size: 11px; color: #999; align-self: center;">+${empCount - 8}</span>` : nothing}
                                </div>
                            </div>
                        ` : nothing}
                    </div>
                `
            })}
        </div>
    `
    litRender(template, grid)
}

