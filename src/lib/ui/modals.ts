// ビジネスエンパイア 2.0 - モーダルUI
// game.ts から全モーダル関連関数を抽出

import { getGame } from '../store/gameStore'
import { PERSONALITIES, SUB_TRAITS, HIDDEN_TRAITS, TEMPERAMENT_TRAITS } from '../config/personalities'
import { DEPARTMENTS, POSITIONS } from '../config/departments'
import { SKILL_TREE, SKILL_EFFECTS } from '../config/skills'
import { OFFICE_LEVELS } from '../config/offices'
import { ACHIEVEMENT_RARITIES, COMPETITOR_ACTIONS, COMPETITOR_STRATEGIES, DIFFICULTY_SETTINGS } from '../gameConfig'
import { Chart } from '../charts'
import { QUALIFICATIONS_30, TIER_EMOJIS, QUALIFICATION_TIERS } from '../qualifications'
import { renderQualificationBadge, renderQualificationDetails } from '../qualificationGenerator'

// レーダーチャートインスタンス
let employeeRadarChart: any = null

// ============================================
// XSS対策用エスケープ関数
// ============================================
export function escapeHtml(unsafe: any): string {
    if (unsafe === null || unsafe === undefined) return ''
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// ============================================
// 倒産チェック
// ============================================
export function requireCompanyActive(): boolean {
    const game = getGame()
    if (!game.isBankrupt) return true
    showModal('操作不可', '倒産状態のため操作できません。再スタートしてください。')
    return false
}

// ============================================
// モーダル基本操作
// ============================================
export function showModal(title: string, body: string, isHtml: boolean = false): void {
    document.getElementById('modalTitle')!.textContent = title
    // isHtmlがtrueの場合は改行置換をスキップ
    document.getElementById('modalBody')!.innerHTML = isHtml ? body : body.replace(/\n/g, '<br>')
    document.getElementById('modal')!.classList.add('active')
}

export function closeModal(): void {
    const modalEl = document.getElementById('modal')!
    modalEl.classList.remove('active', 'employee-detail-modal')

    // レーダーチャートの破棄
    if (employeeRadarChart) {
        employeeRadarChart.destroy()
        employeeRadarChart = null
    }
}

// ============================================
// 詳細モーダルを閉じて採用モーダルを復元
// ============================================
export function closeDetailModal(): void {
    if ((window as any).hireCandidates && (window as any).hireCandidates.length > 0) {
        // 採用モーダルを再表示
        restoreHiringModal()
    } else {
        // 通常のモーダルを閉じる
        closeModal()
    }
}

// ============================================
// 実績解除通知UI
// ============================================
export function showAchievementUnlocked(achievement: any): void {
    const game = getGame()
    const rarity = ACHIEVEMENT_RARITIES[achievement.rarity as keyof typeof ACHIEVEMENT_RARITIES]
    const rewardText = achievement.reward
        ? `<div style="margin-top: 12px; font-size: 13px; color: #28a745;">\u{1F381} 報酬: ${
            achievement.reward.type === 'money' ? `${(achievement.reward.value / 10000).toFixed(0)}万円` :
            achievement.reward.type === 'brandPower' ? `ブランド力+${achievement.reward.value}` :
            `モチベーション+${achievement.reward.value}`
        }</div>`
        : ''

    setTimeout(() => {
        showModal(
            '\u{1F3C6} 実績解除！',
            `<div style="text-align: center; padding: 20px; background: ${rarity.bgColor}; border-radius: 16px;">
                <div style="font-size: 64px; margin-bottom: 16px;">${achievement.emoji}</div>
                <div style="font-size: 18px; font-weight: bold; color: ${rarity.color}; margin-bottom: 8px;">
                    ${achievement.name}
                </div>
                <div style="font-size: 12px; color: ${rarity.color}; text-transform: uppercase; margin-bottom: 12px;">
                    ${rarity.name}
                </div>
                <div style="color: #666; font-size: 14px;">
                    ${achievement.description}
                </div>
                ${rewardText}
            </div>`
        )
    }, 600)

    // 報酬を付与
    if (achievement.reward) {
        switch (achievement.reward.type) {
            case 'money':
                game.money += achievement.reward.value
                break
            case 'brandPower':
                game.brandPower += achievement.reward.value
                break
            case 'motivation':
                game.employees.forEach(emp => {
                    emp.motivation = Math.min(100, (emp.motivation || 80) + achievement.reward!.value)
                })
                break
        }
    }
}

// ============================================
// 採用関連モーダル
// ============================================
export function showHiring(): void {
    if (!requireCompanyActive()) return
    const game = getGame()

    // オフィスレベルによる従業員上限チェック
    const currentOffice = OFFICE_LEVELS[game.officeLevel]
    if (game.employees.length >= currentOffice.maxEmployees) {
        const nextOffice = OFFICE_LEVELS[game.officeLevel + 1]
        const upgradeInfo = nextOffice ?
            `<div style="margin-top: 12px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 6px;">\u{1F4C8} 次のレベル条件</div>
                <div style="font-size: 13px;">
                    ${nextOffice.emoji} ${nextOffice.name}<br>
                    必要: 従業員${nextOffice.unlockConditions.employees}名、資金${Math.floor(nextOffice.unlockConditions.money/10000)}万円、シェア${nextOffice.unlockConditions.marketShare}%
                </div>
            </div>` : ''
        showModal(
            '\u{1F3E2} 採用上限に達しました',
            `現在のオフィス（${currentOffice.emoji} ${currentOffice.name}）では、これ以上従業員を採用できません。<br>
            <br>最大従業員数: <strong>${currentOffice.maxEmployees}名</strong>${upgradeInfo}`
        )
        return
    }

    // 部署選択画面を表示
    showDepartmentSelectionForHiring()
}

// ============================================
// 部署選択画面表示
// ============================================
export function showDepartmentSelectionForHiring(): void {
    const game = getGame()

    // 各部署の現在の従業員数を集計
    const departmentCounts: Record<string, number> = {}
    Object.keys(DEPARTMENTS).forEach(key => {
        departmentCounts[key] = game.employees.filter(emp => emp.department === key).length
    })

    const departmentCardsHtml = Object.keys(DEPARTMENTS).map(deptKey => {
        const dept = DEPARTMENTS[deptKey]
        const count = departmentCounts[deptKey] || 0
        return `
            <div class="department-card" onclick="showHiringForDepartment('${deptKey}')" style="
                padding: 20px;
                margin: 10px 0;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                border: 2px solid rgba(102, 126, 234, 0.2);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.borderColor='rgba(102, 126, 234, 0.5)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.borderColor='rgba(102, 126, 234, 0.2)'; this.style.transform=''; this.style.boxShadow=''">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 24px;">${dept.emoji}</div>
                    <div style="font-size: 13px; color: #667eea; font-weight: 600;">現在: ${count}名</div>
                </div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">${dept.name}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${dept.description}</div>
                <div style="font-size: 11px; color: #999;">
                    主要スキル: ${dept.primaryAbility === 'technical' ? '技術力' :
                                  dept.primaryAbility === 'sales' ? '営業力' :
                                  dept.primaryAbility === 'planning' ? '企画力' : '管理力'}
                </div>
            </div>
        `
    }).join('')

    const modalBody = `
        <div style="margin-bottom: 20px; padding: 14px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
            <div style="font-size: 13px; color: #666;">
                \u{1F4CA} 採用する部署を選択してください。部署に適した応募者が集まります。
            </div>
        </div>
        ${departmentCardsHtml}
        <div style="margin-top: 20px; font-size: 11px; color: #999; text-align: center;">
            \u{1F4B0} 採用募集費: 10万円（部署選択後に支払い）
        </div>
    `

    showModal('\u{1F3E2} 部署別採用活動', modalBody, true)
}

// ============================================
// 特定部署の採用活動
// ============================================
export function showHiringForDepartment(departmentKey: string): void {
    closeModal() // 部署選択モーダルを閉じる
    const game = getGame()

    const recruitmentCost = 100000 // 10万円

    if (game.money < recruitmentCost) {
        showModal('採用失敗', `資金不足です（採用募集費: ${recruitmentCost / 10000}万円必要）`)
        return
    }

    // 採用募集費を支払う
    game.money -= recruitmentCost
    // TODO: Manager接続 - updateDisplay() を呼び出す

    // TODO: Manager接続 - generateCandidateForDepartment を HRManager から import
    // 候補者生成は window.generateCandidateForDepartment を一時使用
    const candidates = [
        (window as any).generateCandidateForDepartment(departmentKey),
        (window as any).generateCandidateForDepartment(departmentKey),
        (window as any).generateCandidateForDepartment(departmentKey)
    ];
    (window as any).hireCandidates = candidates

    // 候補者カードのHTML生成
    const candidateCardsHtml = _buildCandidateCardsHtml(candidates)

    const html = `
        <div style="padding: 16px;">
            <div style="margin-bottom: 16px; text-align: center; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 600;">\u{1F4BC} 3名の候補者から選んでください</div>
                <div style="font-size: 12px; color: #666; margin-top: 6px;">
                    \u{1F4CB} 採用募集費: ${recruitmentCost / 10000}万円 <span style="color: #4caf50;">\u2713 支払済</span>
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ※ 採用時に追加で給与3ヶ月分が必要です
                </div>
            </div>
            <div class="candidates-grid">
                ${candidateCardsHtml}
            </div>
        </div>
    `

    showModal('\u{1F4CB} 採用活動', html, true)
}

// ============================================
// 選択した候補者を採用
// ============================================
export function hireSelectedCandidate(index: number): void {
    const candidate = (window as any).hireCandidates[index]
    if (!candidate) {
        showModal('エラー', '候補者データが見つかりません')
        return
    }
    // TODO: Manager接続 - hireEmployee を呼び出す
    ;(window as any).hireEmployee(candidate)
}

// ============================================
// 旧採用処理
// ============================================
export function hireCurrentCandidate(): void {
    if (!(window as any).currentCandidate) {
        showModal('エラー', '候補者データが見つかりません')
        return
    }
    // TODO: Manager接続 - hireEmployee を呼び出す
    ;(window as any).hireEmployee((window as any).currentCandidate)
}

// ============================================
// 採用モーダルを復元（候補者データから再構築）
// ============================================
export function restoreHiringModal(): void {
    const candidates = (window as any).hireCandidates
    if (!candidates || candidates.length === 0) {
        closeModal()
        return
    }

    const recruitmentCost = 100000

    const candidateCardsHtml = _buildCandidateCardsHtml(candidates)

    const html = `
        <div style="padding: 16px;">
            <div style="margin-bottom: 16px; text-align: center; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 600;">\u{1F4BC} 3名の候補者から選んでください</div>
                <div style="font-size: 12px; color: #666; margin-top: 6px;">
                    \u{1F4CB} 採用募集費: ${recruitmentCost / 10000}万円 <span style="color: #4caf50;">\u2713 支払済</span>
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ※ 採用時に追加で給与3ヶ月分が必要です
                </div>
            </div>
            <div class="candidates-grid">
                ${candidateCardsHtml}
            </div>
        </div>
    `

    showModal('\u{1F4CB} 採用活動', html, true)
}

// ============================================
// 候補者カードHTML生成（共通ヘルパー）
// ============================================
function _buildCandidateCardsHtml(candidates: any[]): string {
    return candidates.map((candidate: any, index: number) => {
        const personality = PERSONALITIES[candidate.personalityKey]
        const avgAbility = Math.round((candidate.abilities.technical + candidate.abilities.sales +
                                        candidate.abilities.planning + candidate.abilities.management) / 4)

        const qualificationBadge = (typeof renderQualificationBadge === 'function' && candidate.qualification) ?
            renderQualificationBadge(candidate.qualification) : ''
        const qualificationDetails = (typeof renderQualificationDetails === 'function' && candidate.qualification) ?
            renderQualificationDetails(candidate.qualification) : ''

        return `
            <div class="candidate-card-hiring ${candidate.qualification ? 'has-qualification' : ''}" data-index="${index}">
                <div class="candidate-header">
                    <div style="font-size: 28px; margin-bottom: 6px;">${personality.emoji}</div>
                    <div class="candidate-name">${escapeHtml(candidate.name)} (${candidate.age}歳)</div>
                    <div class="candidate-personality"
                         onclick="showPersonalityDetail('${candidate.personalityKey}')"
                         style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
                         title="クリックで詳細を表示">
                        ${personality.name}
                    </div>
                    ${qualificationBadge}
                </div>

                <div class="candidate-abilities">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">\u{1F4AA} 能力値 (平均: ${avgAbility})</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px;">
                        <div>\u2699\uFE0F 技術: <strong>${candidate.abilities.technical}</strong></div>
                        <div>\u{1F4BC} 営業: <strong>${candidate.abilities.sales}</strong></div>
                        <div>\u{1F4CB} 企画: <strong>${candidate.abilities.planning}</strong></div>
                        <div>\u{1F454} 管理: <strong>${candidate.abilities.management}</strong></div>
                    </div>
                </div>

                <div class="candidate-traits">
                    <div style="font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                        \u{1F31F} 特性
                        <span style="font-size: 10px; color: #999; font-weight: normal;">（タップで詳細）</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${candidate.subTraits.map((traitKey: string) => {
                            const trait = SUB_TRAITS[traitKey]
                            return `<span class="trait-badge-small ${trait.negative ? 'negative' : 'positive'}"
                                          onclick="showTraitDetail('${traitKey}')"
                                          style="cursor: pointer; transition: transform 0.2s;"
                                          onmouseover="this.style.transform='scale(1.1)'"
                                          onmouseout="this.style.transform='scale(1)'"
                                          title="クリックで詳細: ${trait.name}">${trait.emoji}</span>`
                        }).join('')}
                    </div>
                    <div style="font-size: 10px; color: #999; margin-top: 3px;">※ 隠れ特性あり</div>
                </div>

                ${qualificationDetails}

                <div class="candidate-salary" style="margin: 8px 0;">
                    \u{1F4B0} ${Math.floor(candidate.salary / 10000)}万円/月
                </div>

                <button class="btn-primary candidate-hire-btn" onclick="hireSelectedCandidate(${index})"
                        style="width: 100%; margin-top: 8px;">
                    \u2705 採用する
                </button>
            </div>
        `
    }).join('')
}

// ============================================
// 特性の詳細を表示
// ============================================
export function showTraitDetail(traitKey: string, fromHiring: boolean = false): void {
    const trait = SUB_TRAITS[traitKey]
    if (!trait) return

    const effectList = Object.entries((trait as any).impact || {})
        .map(([key, value]) => `<li>${key}: ${(value as number) > 0 ? '+' : ''}${value}%</li>`)
        .join('')

    // 採用画面から開かれた場合は、閉じるボタンで採用画面に戻る
    const closeAction = (fromHiring || (window as any).hireCandidates) ? 'closeDetailModal()' : 'closeModal()'

    const html = `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${trait.emoji}</div>
            <h3 style="margin: 0 0 8px 0; color: ${trait.negative ? '#f44336' : '#4caf50'};">
                ${trait.name}
            </h3>
            <div style="display: inline-block; padding: 4px 12px; background: ${trait.negative ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)'}; border-radius: 12px; font-size: 11px; margin-bottom: 16px;">
                ${trait.negative ? '\u26A0\uFE0F ネガティブ' : '\u2728 ポジティブ'}
            </div>
            <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 12px;">
                ${trait.effect}
            </div>
            ${effectList ? `
                <div style="background: rgba(240, 240, 240, 0.5); padding: 12px; border-radius: 8px; margin-top: 12px; text-align: left;">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">\u{1F4CA} 効果:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                        ${effectList}
                    </ul>
                </div>
            ` : ''}
            <button class="btn-primary" onclick="${closeAction}" style="margin-top: 16px; width: 100%;">
                閉じる
            </button>
        </div>
    `

    showModal('', html, true)
}

// ============================================
// 性格の詳細を表示
// ============================================
export function showPersonalityDetail(personalityKey: string, fromHiring: boolean = false): void {
    const personality = PERSONALITIES[personalityKey]
    if (!personality) return

    const effectList = Object.entries(personality.effects || {})
        .map(([key, value]) => {
            const effectNames: Record<string, string> = {
                developmentSpeed: '開発速度',
                bugRate: 'バグ発生率',
                teamEfficiency: 'チーム効率',
                salesBonus: '営業ボーナス',
                planningBonus: '企画ボーナス',
                managementBonus: '管理ボーナス',
                learningSpeed: '学習速度',
                creativity: '創造性'
            }
            return `<li>${effectNames[key] || key}: ${(value as number) > 0 ? '+' : ''}${value}%</li>`
        })
        .join('')

    const compatibleList = personality.compatible?.map(k => PERSONALITIES[k]?.name).filter(Boolean).join('、') || 'なし'
    const incompatibleList = personality.incompatible?.map(k => PERSONALITIES[k]?.name).filter(Boolean).join('、') || 'なし'

    // 採用画面から開かれた場合は、閉じるボタンで採用画面に戻る
    const closeAction = (fromHiring || (window as any).hireCandidates) ? 'closeDetailModal()' : 'closeModal()'

    const html = `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${personality.emoji}</div>
            <h3 style="margin: 0 0 16px 0; color: #667eea;">
                ${personality.name}
            </h3>
            <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; text-align: left;">
                ${personality.description || ''}
            </div>
            ${effectList ? `
                <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: left;">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">\u{1F4CA} 効果:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                        ${effectList}
                    </ul>
                </div>
            ` : ''}
            <div style="background: rgba(76, 175, 80, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 8px; text-align: left;">
                <div style="font-weight: 600; font-size: 11px; color: #4caf50; margin-bottom: 4px;">\u2705 相性良い:</div>
                <div style="font-size: 12px;">${compatibleList}</div>
            </div>
            <div style="background: rgba(244, 67, 54, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 16px; text-align: left;">
                <div style="font-weight: 600; font-size: 11px; color: #f44336; margin-bottom: 4px;">\u274C 相性悪い:</div>
                <div style="font-size: 12px;">${incompatibleList}</div>
            </div>
            <button class="btn-primary" onclick="${closeAction}" style="width: 100%;">
                閉じる
            </button>
        </div>
    `

    showModal('', html, true)
}

// ============================================
// 部署異動モーダル
// ============================================
export function showDepartmentChangeModal(employee: any): void {
    if (!requireCompanyActive()) return

    const currentDept = DEPARTMENTS[employee.department]
    const departmentOptions = Object.keys(DEPARTMENTS).map(deptKey => {
        const dept = DEPARTMENTS[deptKey]
        const isCurrent = deptKey === employee.department
        return `
            <button onclick="changeDepartment(${employee.id}, '${deptKey}')"
                    class="dept-option ${isCurrent ? 'current' : ''}"
                    ${isCurrent ? 'disabled' : ''}>
                <div class="dept-emoji">${dept.emoji}</div>
                <div class="dept-name">${dept.name}</div>
                <div class="dept-desc">${dept.description}</div>
                ${isCurrent ? '<div class="current-badge">現在の部署</div>' : ''}
            </button>
        `
    }).join('')

    const html = `
        <div style="margin: 16px 0;">
            <p style="margin-bottom: 16px; color: #666;">
                ${escapeHtml(employee.name)}の配属先を変更します
            </p>
            <div class="dept-options-grid">
                ${departmentOptions}
            </div>
        </div>
    `

    showModal('\u{1F3E2} 部署異動', html)
}

// ============================================
// 従業員詳細モーダル
// ============================================
export function showEmployeeDetail(employee: any): void {
    const game = getGame()
    const personality = PERSONALITIES[employee.personalityKey] || PERSONALITIES.logical

    // ヘッダー情報
    let headerHtml = `
        <div class="employee-detail-header">
            <div class="employee-detail-icon">${personality.emoji}</div>
            <div class="employee-detail-info">
                <div class="employee-detail-name">${escapeHtml(employee.name)}</div>
                <div class="employee-detail-meta">
                    ${personality.name} | \u{1F4B0} 月給 ${Math.floor(employee.salary / 10000)}万円
                </div>
            </div>
        </div>
    `

    // 性格の効果説明
    const personalityEffectsHtml = `
        <div style="margin-bottom: 16px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #667eea; cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
                 onclick="showPersonalityDetail('${employee.personalityKey}')"
                 title="クリックで詳細を表示">
                ${personality.emoji} ${personality.name}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
                ${Object.entries(personality.effects || {}).map(([key, value]) => {
                    const effectName: Record<string, string> = {
                        developmentSpeed: '開発速度',
                        bugRate: 'バグ発生率',
                        teamEfficiency: 'チーム効率',
                        salesBonus: '営業ボーナス',
                        planningBonus: '企画ボーナス',
                        managementBonus: '管理ボーナス',
                        learningSpeed: '学習速度',
                        creativity: '創造性',
                        motivation: 'モチベーション'
                    }
                    const isNegative = (key === 'bugRate' && (value as number) > 1) || (value as number) < 1
                    const displayValue = (value as number) > 1 ? `+${Math.round(((value as number) - 1) * 100)}%` : `${Math.round((1 - (value as number)) * 100)}%減`
                    return `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>\u{1F4CA} ${effectName[key] || key}</span>
                        <span style="font-weight: 600; color: ${isNegative ? '#f44336' : '#4caf50'};">${displayValue}</span>
                    </div>`
                }).join('')}
            </div>
            ${personality.compatible ? `
                <div style="font-size: 12px; color: #4caf50; margin-top: 8px;">
                    \u2705 相性良好: ${personality.compatible.map(k => PERSONALITIES[k]?.name || k).join(', ')}
                </div>
            ` : ''}
            ${personality.incompatible ? `
                <div style="font-size: 12px; color: #f44336; margin-top: 4px;">
                    \u274C 相性悪い: ${personality.incompatible.map(k => PERSONALITIES[k]?.name || k).join(', ')}
                </div>
            ` : ''}
        </div>
    `

    // 資格情報セクション
    let qualificationSectionHtml = ''
    if (employee.qualification && typeof QUALIFICATIONS_30 !== 'undefined') {
        const qual = QUALIFICATIONS_30[employee.qualification]
        if (qual) {
            const qualBadge = typeof renderQualificationBadge === 'function' ?
                renderQualificationBadge(employee.qualification) : ''
            const qualDetails = typeof renderQualificationDetails === 'function' ?
                renderQualificationDetails(employee.qualification) : ''

            qualificationSectionHtml = `
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 215, 0, 0.05); border-radius: 12px; border: 2px solid rgba(255, 215, 0, 0.3);">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #FFD700;">\u{1F393} 保有資格</div>
                    ${qualBadge}
                    ${qualDetails}
                </div>
            `
        }
    }

    // 特性表示
    let traitsHtml = ''
    if (employee.subTraits && employee.subTraits.length > 0) {
        traitsHtml = `
            <div style="margin-bottom: 16px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #667eea;">
                    \u{1F31F} 特性
                    <span style="font-size: 10px; color: #999; font-weight: normal;">（クリックで詳細）</span>
                </div>
                <div style="display: grid; gap: 8px;">
                    ${employee.subTraits.map((traitKey: string) => {
                        const trait = SUB_TRAITS[traitKey]
                        if (!trait) return ''
                        return `
                            <div style="padding: 10px; background: ${trait.negative ? 'rgba(244, 67, 54, 0.05)' : 'rgba(76, 175, 80, 0.05)'}; border-radius: 8px; border-left: 3px solid ${trait.negative ? '#f44336' : '#4caf50'}; cursor: pointer; transition: transform 0.2s;"
                                 onclick="showTraitDetail('${traitKey}')"
                                 onmouseover="this.style.transform='scale(1.02)'"
                                 onmouseout="this.style.transform='scale(1)'"
                                 title="クリックで詳細を表示">
                                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span class="trait-badge ${trait.negative ? 'negative' : 'positive'}" style="margin: 0;">
                                        ${trait.emoji} ${trait.name}
                                    </span>
                                </div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${trait.effect}
                                </div>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        `
    }

    if (employee.hiddenTraitRevealed) {
        const hiddenTrait = HIDDEN_TRAITS[employee.hiddenTrait]
        traitsHtml += `
            <div style="margin-bottom: 16px;">
                <span class="trait-badge hidden">
                    \u2728 ${hiddenTrait.emoji} ${hiddenTrait.name}
                </span>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${hiddenTrait.effect}
                </div>
            </div>
        `
    }

    // レーダーチャートコンテナ
    const radarHtml = `
        <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #667eea;">\u{1F4CA} 能力値</div>
            <div class="radar-chart-container">
                <canvas id="employeeRadarChart"></canvas>
            </div>
        </div>
    `

    // 気質パラメータ表示
    const temperamentHtml = employee.temperament ? `
        <div style="margin-bottom: 16px; padding: 16px; background: rgba(255, 215, 0, 0.05); border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2);">
            <div style="font-weight: 600; margin-bottom: 12px; color: #f59e0b;">\u{1F3AD} 気質パラメータ</div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 13px;">
                ${Object.keys(TEMPERAMENT_TRAITS).map(key => {
                    const trait = TEMPERAMENT_TRAITS[key]
                    const value = employee.temperament[key] || 50
                    const percentage = Math.min(100, Math.max(0, value))
                    const barColor = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444'
                    const isStrong = percentage >= 70
                    return `
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-weight: 500;">${trait.emoji} ${trait.name}</span>
                                <span style="font-weight: 600; color: ${barColor};">${percentage}${isStrong ? ' \u2B50' : ''}</span>
                            </div>
                            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: ${barColor}; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `
                }).join('')}
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 12px; text-align: center;">
                \u{1F4A1} 70以上で強み、40未満で弱みとして影響
            </div>
        </div>
    ` : ''

    // 部署・役職情報と操作ボタン
    const dept = DEPARTMENTS[employee.department]
    const position = POSITIONS[employee.position]
    // TODO: Manager接続 - canPromote を HRManager から import
    const canPromoteNow = (window as any).canPromote ? (window as any).canPromote(employee) : false

    const deptPositionHtml = `
        <div style="margin-bottom: 16px; padding: 16px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 12px; color: #667eea;">\u{1F4BC} 所属・役職</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 11px; color: #999; margin-bottom: 4px;">部署</div>
                    <div style="font-weight: 600;">${dept.emoji} ${dept.name}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">${dept.description}</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #999; margin-bottom: 4px;">役職</div>
                    <div style="font-weight: 600;">${position.emoji} ${position.name}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">${position.description}</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                <button onclick="showDepartmentChangeModal(game.employees.find(e => e.id === ${employee.id}))"
                        class="btn-secondary">
                    \u{1F3E2} 部署異動
                </button>
                <button onclick="showSkillTreeModal(game.employees.find(e => e.id === ${employee.id}))"
                        class="btn-secondary" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)); border-color: rgba(102, 126, 234, 0.5);">
                    \u{1F333} スキルツリー ${(employee.skillPoints || 0) > 0 ? `<strong style="color: #667eea;">(${employee.skillPoints}SP)</strong>` : ''}
                </button>
                ${canPromoteNow ? `
                    <button onclick="promoteEmployee(${employee.id})"
                            class="btn-primary" style="grid-column: 1 / -1;">
                        \u2B50 昇進させる
                    </button>
                ` : `
                    <button disabled class="btn-secondary" style="grid-column: 1 / -1; opacity: 0.5;">
                        \u{1F512} 昇進不可
                    </button>
                `}
            </div>
            ${!canPromoteNow && employee.position !== 'director' ? `
                <div style="font-size: 11px; color: #999; margin-top: 8px; text-align: center;">
                    \u{1F4A1} 平均能力${POSITIONS[(['senior', 'manager', 'director'][['staff', 'senior', 'manager'].indexOf(employee.position) + 1]) as string]?.requiredAbility || 100}以上で昇進可能
                </div>
            ` : ''}
        </div>
    `

    // 成長履歴タイムライン
    const historyHtml = `
        <div class="growth-timeline">
            <div class="timeline-title">
                \u{1F4C8} 成長履歴
            </div>
            ${(employee.growthHistory || []).map((history: any) => `
                <div class="timeline-item">
                    <div class="timeline-turn">第${history.turn}週</div>
                    <div class="timeline-event">${escapeHtml(history.event)}</div>
                    <div class="timeline-description">${escapeHtml(history.description)}</div>
                </div>
            `).join('')}
        </div>
    `

    const modalBody = headerHtml + personalityEffectsHtml + qualificationSectionHtml + traitsHtml + radarHtml + temperamentHtml + deptPositionHtml + historyHtml

    // モーダルを表示
    document.getElementById('modalTitle')!.textContent = '\u{1F464} 従業員詳細'
    document.getElementById('modalBody')!.innerHTML = modalBody
    const modalEl = document.getElementById('modal')!
    modalEl.classList.add('active', 'employee-detail-modal')

    // レーダーチャートを描画（DOMが更新された後）
    setTimeout(() => {
        renderEmployeeRadarChart(employee)
    }, 50)
}

// ============================================
// 従業員レーダーチャート描画
// ============================================
export function renderEmployeeRadarChart(employee: any): void {
    const canvas = document.getElementById('employeeRadarChart') as HTMLCanvasElement | null
    if (!canvas) return

    // 既存のチャートを破棄
    if (employeeRadarChart) {
        employeeRadarChart.destroy()
        employeeRadarChart = null
    }

    employeeRadarChart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: ['技術力', '営業力', '企画力', '管理力'],
            datasets: [{
                label: '能力値',
                data: [
                    employee.abilities.technical,
                    employee.abilities.sales,
                    employee.abilities.planning,
                    employee.abilities.management
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    })
}

// ============================================
// スキルツリーモーダル
// ============================================
export function showSkillTreeModal(employee: any): void {
    const categories = Object.keys(SKILL_TREE)

    // カテゴリタブを生成
    const tabsHtml = categories.map((catKey, index) => {
        const cat = SKILL_TREE[catKey]
        return `
            <button
                class="skill-tab ${index === 0 ? 'active' : ''}"
                onclick="switchSkillCategory('${catKey}')"
                data-category="${catKey}"
                style="background: ${index === 0 ? cat.color : 'rgba(255,255,255,0.1)'};">
                ${cat.emoji} ${cat.name}
            </button>
        `
    }).join('')

    // 各カテゴリのスキルカードを生成
    const skillPanelsHtml = categories.map((catKey, index) => {
        const cat = SKILL_TREE[catKey]
        const skillsHtml = Object.keys(cat.skills).map(skillId => {
            const skill = cat.skills[skillId]
            const isUnlocked = employee.unlockedSkills.includes(skillId)
            // TODO: Manager接続 - canUnlockSkill を正式に import
            const canUnlock = (window as any).canUnlockSkill ? (window as any).canUnlockSkill(employee, catKey, skillId) : false
            const isLocked = !isUnlocked && !canUnlock

            // 前提スキル表示
            let prereqHtml = ''
            if (skill.prerequisites && skill.prerequisites.length > 0) {
                const prereqNames = skill.prerequisites.map((prereqId: string) => {
                    const prereqCat = Object.keys(SKILL_TREE).find(ck => SKILL_TREE[ck].skills[prereqId])
                    const prereqSkill = prereqCat ? SKILL_TREE[prereqCat].skills[prereqId] : null
                    const prereqUnlocked = employee.unlockedSkills.includes(prereqId)
                    return prereqSkill ?
                        `<span style="color: ${prereqUnlocked ? '#4caf50' : '#f44336'};">${prereqSkill.icon} ${prereqSkill.name}</span>`
                        : prereqId
                }).join(', ')
                prereqHtml = `
                    <div style="font-size: 11px; color: #999; margin-top: 8px;">
                        前提: ${prereqNames}
                    </div>
                `
            }

            // 特殊効果表示
            const specialEffect = skill.special ? SKILL_EFFECTS[skill.special] : null
            const specialHtml = specialEffect ?
                `<div style="font-size: 11px; color: #f093fb; margin-top: 6px;">\u2728 ${specialEffect.description}</div>`
                : ''

            return `
                <div class="skill-card ${isUnlocked ? 'unlocked' : ''} ${isLocked ? 'locked' : ''} ${canUnlock ? 'can-unlock' : ''}"
                     onclick="${canUnlock ? `unlockSkill(${employee.id}, '${catKey}', '${skillId}')` : ''}"
                     style="cursor: ${canUnlock ? 'pointer' : 'default'}; opacity: ${isLocked ? '0.4' : '1'};">
                    <div style="font-size: 32px; margin-bottom: 8px;">${skill.icon}</div>
                    <div style="font-weight: 600; margin-bottom: 4px; color: ${isUnlocked ? '#4caf50' : (canUnlock ? cat.color : '#666')};">
                        ${skill.name}
                        ${isUnlocked ? ' \u2713' : ''}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                        ${skill.description}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 4px;">
                        ${Object.entries(skill.effect || {}).map(([key, value]) =>
                            `<span style="color: ${cat.color};">${key}+${value}</span>`
                        ).join(' ')}
                    </div>
                    ${specialHtml}
                    ${prereqHtml}
                    <div style="margin-top: 8px; font-size: 12px; font-weight: 600; color: ${canUnlock ? cat.color : '#999'};">
                        ${isUnlocked ? '習得済み' : `コスト: ${skill.cost}SP`}
                    </div>
                </div>
            `
        }).join('')

        return `
            <div class="skill-panel ${index === 0 ? 'active' : ''}" data-category="${catKey}">
                <div class="skill-grid">
                    ${skillsHtml}
                </div>
            </div>
        `
    }).join('')

    const html = `
        <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #667eea;">\u{1F333} ${escapeHtml(employee.name)} のスキルツリー</h3>
                <div style="background: rgba(102, 126, 234, 0.15); padding: 8px 16px; border-radius: 20px; font-weight: 600; color: #667eea;">
                    \u{1F48E} ${employee.skillPoints} SP
                </div>
            </div>

            <div class="skill-tabs">
                ${tabsHtml}
            </div>

            ${skillPanelsHtml}

            <div style="margin-top: 16px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; font-size: 13px; color: #666;">
                \u{1F4A1} ヒント: 研修や昇進でスキルポイントを獲得できます。スキルを習得すると能力値がアップします！
            </div>
        </div>
    `

    showModal('', html, true)
}

// ============================================
// スキルカテゴリ切り替え
// ============================================
export function switchSkillCategory(category: string): void {
    // タブの切り替え
    document.querySelectorAll('.skill-tab').forEach(tab => {
        const tabEl = tab as HTMLElement
        const isActive = tabEl.dataset.category === category
        tabEl.classList.toggle('active', isActive)
        if (isActive) {
            const color = SKILL_TREE[category]?.color || '#667eea'
            tabEl.style.background = color
        } else {
            tabEl.style.background = 'rgba(255,255,255,0.1)'
        }
    })

    // パネルの切り替え
    document.querySelectorAll('.skill-panel').forEach(panel => {
        const panelEl = panel as HTMLElement
        panelEl.classList.toggle('active', panelEl.dataset.category === category)
    })
}

// ============================================
// 研修プログラム選択モーダル
// ============================================
export function trainEmployees(): void {
    if (!requireCompanyActive()) return
    const game = getGame()

    if (game.employees.length === 0) {
        showModal('研修失敗', '従業員がいません')
        return
    }
    const cost = 300000 * game.employees.length
    if (game.money < cost) {
        showModal('研修失敗', `資金不足です（必要: ${cost / 10000}万円）`)
        return
    }

    const modalHtml = `
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                    研修の方向性を選択してください
                </div>
                <div style="font-size: 12px; color: #999;">
                    \u{1F4B0} 費用: ${cost / 10000}万円 | \u{1F465} 対象: ${game.employees.length}名
                </div>
            </div>

            <div style="display: grid; gap: 12px;">
                <button class="btn-primary" onclick="executeTraining('balanced')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">\u2696\uFE0F</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">バランス型研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">全能力をまんべんなく向上（基本+10）</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('technical')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    <span style="font-size: 24px;">\u2699\uFE0F</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">技術力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">技術力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('sales')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f093fb, #f5576c);">
                    <span style="font-size: 24px;">\u{1F4BC}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">営業力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">営業力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('planning')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #4facfe, #00f2fe);">
                    <span style="font-size: 24px;">\u{1F4CB}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">企画力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">企画力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('management')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <span style="font-size: 24px;">\u{1F454}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">管理力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">管理力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-secondary" onclick="closeModal()"
                        style="padding: 12px; margin-top: 8px;">
                    キャンセル
                </button>
            </div>
        </div>
    `

    showModal('\u{1F4DA} 研修プログラム選択', modalHtml, true)
}

// ============================================
// マーケティング戦略選択モーダル
// ============================================
export function doMarketing(): void {
    if (!requireCompanyActive()) return
    const game = getGame()
    const cost = 1000000

    if (game.money < cost) {
        showModal('実施失敗', `資金不足です（${cost / 10000}万円必要）`)
        return
    }

    const modalHtml = `
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                    マーケティング戦略を選択してください
                </div>
                <div style="font-size: 12px; color: #999;">
                    \u{1F4B0} 費用: ${cost / 10000}万円
                </div>
            </div>

            <div style="display: grid; gap: 12px;">
                <button class="btn-primary" onclick="executeMarketing('balanced')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">\u2696\uFE0F</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">バランス型キャンペーン</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.3%、ブランド力+1.0</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('brand')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    <span style="font-size: 24px;">\u{1F31F}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">ブランド重視</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.2%、ブランド力+2.0</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('share')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f093fb, #f5576c);">
                    <span style="font-size: 24px;">\u{1F4C8}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">シェア拡大重視</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.5%、ブランド力+0.5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('niche')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #4facfe, #00f2fe);">
                    <span style="font-size: 24px;">\u{1F3AF}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">ニッチ戦略</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.1%、ブランド力+1.5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('lowprice')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <span style="font-size: 24px;">\u{1F4B0}</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">低価格戦略</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.6%、ブランド力-0.3</div>
                    </div>
                </button>

                <button class="btn-secondary" onclick="closeModal()"
                        style="padding: 12px; margin-top: 8px;">
                    キャンセル
                </button>
            </div>
        </div>
    `

    showModal('\u{1F4E2} マーケティング戦略選択', modalHtml, true)
}
