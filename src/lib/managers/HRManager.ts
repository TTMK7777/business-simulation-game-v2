// ビジネスエンパイア 2.0 - HR Manager
// game.ts から抽出した人事関連の純粋ロジック

import { getGame } from '../store/gameStore'
import { PERSONALITIES, SUB_TRAITS, HIDDEN_TRAITS, generateTemperament } from '../config/personalities'
import { DEPARTMENTS, POSITIONS } from '../config/departments'
import { SKILL_TREE, SKILL_EFFECTS } from '../config/skills'
import type {
    Employee,
    HireResult,
    PromotionResult,
    DepartmentChangeResult,
    SkillUnlockResult,
    TrainingResult
} from '../types'
import { selectQualificationForCandidate, calculateCandidateSalaryWithQualification } from '../qualificationGenerator'

// ============================================
// チーム相性計算
// ============================================

/** チーム相性を計算 (game.ts:781-810) */
export function calculateTeamCompatibility(employees: Employee[]): number {
    if (!employees || employees.length < 2) return 1.0

    let compatibilityScore = 1.0

    for (let i = 0; i < employees.length; i++) {
        for (let j = i + 1; j < employees.length; j++) {
            const emp1 = employees[i]
            const emp2 = employees[j]

            if (!emp1.personalityKey || !emp2.personalityKey) continue

            const personality1 = PERSONALITIES[emp1.personalityKey]
            const personality2 = PERSONALITIES[emp2.personalityKey]

            if (!personality1 || !personality2) continue

            // 相性良い
            if (personality1.compatible && personality1.compatible.includes(emp2.personalityKey)) {
                compatibilityScore += 0.1
            }
            // 相性悪い
            if (personality1.incompatible && personality1.incompatible.includes(emp2.personalityKey)) {
                compatibilityScore -= 0.15
            }
        }
    }

    return Math.max(0.7, Math.min(1.3, compatibilityScore))
}

// ============================================
// 成長倍率計算
// ============================================

/** 能力値に応じた成長倍率を計算 (逓減型成長曲線) (game.ts:3005-3010) */
export function calculateGrowthMultiplier(currentAbility: number): number {
    if (currentAbility >= 90) return 0.2  // 90+: 20% (ほぼ成長しない)
    if (currentAbility >= 80) return 0.4  // 80-89: 40% (かなり鈍化)
    if (currentAbility >= 70) return 0.6  // 70-79: 60% (成長鈍化)
    return 1.0  // 0-69: 100% (通常成長)
}

// ============================================
// 候補者生成
// ============================================

/** 従業員候補を生成 (game.ts:2405-2470) */
export function generateCandidate(): Employee {
    const game = getGame()
    const names = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤']
    const firstNames = ['太郎', '花子', '一郎', '美咲', '健太', '優子', '翔太', '愛', '大輔', '綾乃']

    const personalityKeys = Object.keys(PERSONALITIES)
    const selectedPersonalityKey = personalityKeys[Math.floor(Math.random() * personalityKeys.length)]

    const subTraitKeys = Object.keys(SUB_TRAITS)
    const numSubTraits = 2 + Math.floor(Math.random() * 2)
    const selectedSubTraits: string[] = []
    const shuffledSubTraits = [...subTraitKeys].sort(() => Math.random() - 0.5)
    for (let i = 0; i < numSubTraits && i < shuffledSubTraits.length; i++) {
        selectedSubTraits.push(shuffledSubTraits[i])
    }

    const hiddenTraitKeys = Object.keys(HIDDEN_TRAITS)
    const selectedHiddenTrait = hiddenTraitKeys[Math.floor(Math.random() * hiddenTraitKeys.length)]

    const departmentKeys = Object.keys(DEPARTMENTS)
    const selectedDepartmentKey = departmentKeys[Math.floor(Math.random() * departmentKeys.length)]
    const selectedDepartment = DEPARTMENTS[selectedDepartmentKey]

    const candidate: any = {
        id: Date.now() + Math.random(),
        name: names[Math.floor(Math.random() * names.length)] + ' ' +
              firstNames[Math.floor(Math.random() * firstNames.length)],
        age: 22 + Math.floor(Math.random() * 18),
        personalityKey: selectedPersonalityKey,
        abilities: {
            technical: 30 + Math.floor(Math.random() * 50),
            sales: 30 + Math.floor(Math.random() * 50),
            planning: 30 + Math.floor(Math.random() * 50),
            management: 30 + Math.floor(Math.random() * 50)
        },
        temperament: generateTemperament(selectedPersonalityKey),
        subTraits: selectedSubTraits,
        hiddenTrait: selectedHiddenTrait,
        hiddenTraitRevealed: false,
        joinedTurn: game.turn,
        motivation: 70,
        department: selectedDepartmentKey,
        position: 'staff',
        skillPoints: 0,
        unlockedSkills: [],
        growthHistory: [
            { turn: game.turn, event: '入社', description: `${selectedDepartment.emoji} ${selectedDepartment.name}に配属されました` }
        ]
    }

    // 資格選択（全体で約5%が保有、難関資格は0.5%以下）
    candidate.qualification = selectQualificationForCandidate(candidate)

    // 資格を考慮した給与計算
    candidate.salary = calculateCandidateSalaryWithQualification(candidate, candidate.qualification)

    return candidate as Employee
}

/** 部署別候補者生成 (game.ts:2473-2552) */
export function generateCandidateForDepartment(departmentKey: string): Employee {
    const game = getGame()
    const names = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤']
    const firstNames = ['太郎', '花子', '一郎', '美咲', '健太', '優子', '翔太', '愛', '大輔', '綾乃']

    const department = DEPARTMENTS[departmentKey]
    if (!department) {
        return generateCandidate()
    }

    const personalityKeys = Object.keys(PERSONALITIES)
    const selectedPersonalityKey = personalityKeys[Math.floor(Math.random() * personalityKeys.length)]

    const subTraitKeys = Object.keys(SUB_TRAITS)
    const numSubTraits = 2 + Math.floor(Math.random() * 2)
    const selectedSubTraits: string[] = []
    const shuffledSubTraits = [...subTraitKeys].sort(() => Math.random() - 0.5)
    for (let i = 0; i < numSubTraits && i < shuffledSubTraits.length; i++) {
        selectedSubTraits.push(shuffledSubTraits[i])
    }

    const hiddenTraitKeys = Object.keys(HIDDEN_TRAITS)
    const selectedHiddenTrait = hiddenTraitKeys[Math.floor(Math.random() * hiddenTraitKeys.length)]

    // 部署に応じたスキル生成（重み付け適用）
    const abilities: Record<string, number> = {}
    Object.keys(department.abilityWeights).forEach(abilityKey => {
        const weight = department.abilityWeights[abilityKey]
        abilities[abilityKey] = weight.min + Math.floor(Math.random() * (weight.max - weight.min + 1))
    })

    // 気質パラメータ生成（部署の重み付けを適用）
    const baseTemperament = generateTemperament(selectedPersonalityKey)
    const temperament = { ...baseTemperament }

    if (department.temperamentWeights) {
        Object.keys(department.temperamentWeights).forEach(traitKey => {
            const adjustment = department.temperamentWeights![traitKey]
            ;(temperament as any)[traitKey] = Math.max(0, Math.min(100, (temperament as any)[traitKey] + adjustment))
        })
    }

    const candidate: any = {
        id: Date.now() + Math.random(),
        name: names[Math.floor(Math.random() * names.length)] + ' ' +
              firstNames[Math.floor(Math.random() * firstNames.length)],
        age: 22 + Math.floor(Math.random() * 18),
        personalityKey: selectedPersonalityKey,
        abilities: abilities,
        temperament: temperament,
        subTraits: selectedSubTraits,
        hiddenTrait: selectedHiddenTrait,
        hiddenTraitRevealed: false,
        joinedTurn: game.turn,
        motivation: 70,
        department: departmentKey,
        position: 'staff',
        skillPoints: 0,
        unlockedSkills: [],
        growthHistory: [
            { turn: game.turn, event: '入社', description: `${department.emoji} ${department.name}に配属されました` }
        ]
    }

    // 資格選択
    candidate.qualification = selectQualificationForCandidate(candidate)

    // 資格を考慮した給与計算
    candidate.salary = calculateCandidateSalaryWithQualification(candidate, candidate.qualification)

    return candidate as Employee
}

// ============================================
// 採用
// ============================================

/** 従業員を採用（純粋ロジック、UI操作なし）(game.ts:2976-3002) */
export function hireEmployee(candidate: Employee): HireResult {
    const game = getGame()

    if (game.isBankrupt) {
        return { success: false, message: '倒産状態のため操作できません。再スタートしてください。' }
    }

    if (game.money < candidate.salary * 3) {
        return { success: false, message: '資金不足です（3ヶ月分の給与が必要）' }
    }

    game.money -= candidate.salary * 3
    game.employees.push(candidate)

    return { success: true, message: `${candidate.name}さんを採用しました！`, employee: candidate }
}

// ============================================
// 昇進
// ============================================

/** 昇進可能かチェック (game.ts:3082-3100) */
export function canPromote(employee: Employee): boolean {
    const positionOrder = ['staff', 'senior', 'manager', 'director']
    const currentIndex = positionOrder.indexOf(employee.position)

    if (currentIndex === -1 || currentIndex >= positionOrder.length - 1) {
        return false
    }

    const nextPositionKey = positionOrder[currentIndex + 1]
    const nextPosition = POSITIONS[nextPositionKey]

    const avgAbility = (employee.abilities.technical + employee.abilities.sales +
                        employee.abilities.planning + employee.abilities.management) / 4

    return avgAbility >= nextPosition.requiredAbility
}

/** 従業員を昇進させる（純粋ロジック、UI操作なし）(game.ts:3101-3169) */
export function promoteEmployee(employeeId: number): PromotionResult {
    const game = getGame()

    if (game.isBankrupt) {
        return { success: false, message: '倒産状態のため操作できません。再スタートしてください。' }
    }

    const employee = game.employees.find(e => e.id === employeeId)
    if (!employee) {
        return { success: false, message: '従業員が見つかりません' }
    }

    if (!canPromote(employee)) {
        return { success: false, message: '昇進に必要な能力値を満たしていません' }
    }

    const positionOrder = ['staff', 'senior', 'manager', 'director']
    const currentIndex = positionOrder.indexOf(employee.position)
    const nextPositionKey = positionOrder[currentIndex + 1]

    const oldPosition = POSITIONS[employee.position]
    const newPosition = POSITIONS[nextPositionKey]

    // 役職を上げる
    employee.position = nextPositionKey

    // 給与を調整 (役職の給与倍率を適用)
    const baseSalary = employee.salary / oldPosition.salaryMultiplier
    employee.salary = Math.floor(baseSalary * newPosition.salaryMultiplier)

    // 昇進ボーナス: スキルポイント付与
    const promotionBonus: Record<string, number> = {
        senior: 3,
        manager: 5,
        director: 10
    }
    const bonusPoints = promotionBonus[nextPositionKey] || 0
    employee.skillPoints = (employee.skillPoints || 0) + bonusPoints

    // 成長履歴に記録
    if (!employee.growthHistory) employee.growthHistory = []
    employee.growthHistory.push({
        turn: game.turn,
        event: '昇進',
        description: `${oldPosition.emoji} ${oldPosition.name} から ${newPosition.emoji} ${newPosition.name} へ昇進！ | スキルポイント+${bonusPoints}`
    })

    return {
        success: true,
        message: `${employee.name}を昇進させました！`,
        employee,
        oldPosition: employee.position,
        newPosition: nextPositionKey,
        bonusPoints
    }
}

// ============================================
// 部署異動
// ============================================

/** 部署を変更（純粋ロジック、UI操作なし）(game.ts:3047-3080) */
export function changeDepartment(employeeId: number, newDepartmentKey: string): DepartmentChangeResult {
    const game = getGame()

    if (game.isBankrupt) {
        return { success: false, message: '倒産状態のため操作できません。再スタートしてください。' }
    }

    const employee = game.employees.find(e => e.id === employeeId)
    if (!employee) {
        return { success: false, message: '従業員が見つかりません' }
    }

    if (employee.department === newDepartmentKey) {
        return { success: false, message: 'すでにその部署に所属しています' }
    }

    const oldDept = DEPARTMENTS[employee.department]
    const newDept = DEPARTMENTS[newDepartmentKey]

    const oldDepartment = employee.department
    employee.department = newDepartmentKey

    // 成長履歴に記録
    if (!employee.growthHistory) employee.growthHistory = []
    employee.growthHistory.push({
        turn: game.turn,
        event: '部署異動',
        description: `${oldDept.emoji} ${oldDept.name} から ${newDept.emoji} ${newDept.name} へ異動`
    })

    return {
        success: true,
        message: `${employee.name}を${newDept.emoji} ${newDept.name}に異動させました！`,
        employee,
        oldDepartment,
        newDepartment: newDepartmentKey
    }
}

// ============================================
// スキルツリー
// ============================================

/** スキルが獲得可能かチェック (game.ts:3174-3196) */
export function canUnlockSkill(employee: Employee, category: string, skillId: string): boolean {
    const skill = SKILL_TREE[category]?.skills[skillId]
    if (!skill) return false

    // 既に獲得済み
    if (employee.unlockedSkills.includes(skillId)) return false

    // スキルポイント不足
    if (employee.skillPoints < skill.cost) return false

    // 前提スキル未獲得
    if (skill.prerequisites && skill.prerequisites.length > 0) {
        for (const prereq of skill.prerequisites) {
            if (!employee.unlockedSkills.includes(prereq)) {
                return false
            }
        }
    }

    return true
}

/** スキルを獲得（純粋ロジック、UI操作なし）(game.ts:3197-3290) */
export function unlockSkill(employeeId: number, category: string, skillId: string): SkillUnlockResult {
    const game = getGame()

    if (game.isBankrupt) {
        return { success: false, message: '倒産状態のため操作できません。再スタートしてください。' }
    }

    const employee = game.employees.find(e => e.id === employeeId)
    if (!employee) {
        return { success: false, message: '従業員が見つかりません' }
    }

    const skill = SKILL_TREE[category]?.skills[skillId]
    if (!skill) {
        return { success: false, message: 'スキルが見つかりません' }
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
        return { success: false, message: reason }
    }

    // スキルポイント消費
    employee.skillPoints -= skill.cost

    // スキル獲得
    employee.unlockedSkills.push(skillId)

    // 能力値ボーナス適用
    if (skill.effect) {
        Object.keys(skill.effect).forEach(abilityKey => {
            if ((employee.abilities as any)[abilityKey] !== undefined) {
                (employee.abilities as any)[abilityKey] = Math.min(100, (employee.abilities as any)[abilityKey] + skill.effect[abilityKey])
            }
        })
    }

    // 成長履歴に記録
    if (!employee.growthHistory) employee.growthHistory = []
    const effectText = Object.entries(skill.effect || {})
        .map(([key, value]) => `${key}+${value}`)
        .join(', ')
    employee.growthHistory.push({
        turn: game.turn,
        event: 'スキル獲得',
        description: `${skill.icon} ${skill.name} を習得！ (${effectText})`
    })

    const specialEffect = skill.special ? SKILL_EFFECTS[skill.special] : null

    return {
        success: true,
        message: `${employee.name}が${skill.name}を習得しました！`,
        employee,
        skill,
        specialEffect
    }
}

// ============================================
// 研修
// ============================================

/** 研修を実行（純粋ロジック、UI操作なし）(game.ts:3501-3601) */
export function executeTraining(focusType: string): TrainingResult {
    const game = getGame()

    if (game.isBankrupt) {
        return { success: false, message: '倒産状態のため操作できません。', growthDetails: [], bonusMessages: [] }
    }

    if (game.employees.length === 0) {
        return { success: false, message: '従業員がいません', growthDetails: [], bonusMessages: [] }
    }

    const cost = 300000 * game.employees.length

    if (game.money < cost) {
        return { success: false, message: '資金不足です', growthDetails: [], bonusMessages: [] }
    }

    game.money -= cost

    const bonusMessages: string[] = []
    const growthDetails: { name: string; growth: number }[] = []

    game.employees.forEach(emp => {
        let baseIncrease = 10

        // fast_learner特性で研修効果+50%
        if (emp.subTraits && emp.subTraits.includes('fast_learner')) {
            baseIncrease = Math.floor(baseIncrease * 1.5)
            bonusMessages.push(`${emp.name}は早習得で効果アップ！`)
        }

        // researcher性格で学習速度+30%
        if (emp.personalityKey === 'researcher') {
            baseIncrease = Math.floor(baseIncrease * 1.3)
            bonusMessages.push(`${emp.name}は研究者気質で効果アップ！`)
        }

        // 研修方向性に応じた成長量を設定
        const focusMap: Record<string, Record<string, number>> = {
            'balanced': { technical: 1.0, sales: 1.0, planning: 1.0, management: 1.0 },
            'technical': { technical: 1.5, sales: 0.5, planning: 0.5, management: 0.5 },
            'sales': { technical: 0.5, sales: 1.5, planning: 0.5, management: 0.5 },
            'planning': { technical: 0.5, sales: 0.5, planning: 1.5, management: 0.5 },
            'management': { technical: 0.5, sales: 0.5, planning: 0.5, management: 1.5 }
        }

        const focusMultipliers = focusMap[focusType] || focusMap['balanced']

        // 能力別に逓減成長を適用
        let totalGrowth = 0
        Object.keys(emp.abilities).forEach(key => {
            const currentAbility = (emp.abilities as any)[key]
            const growthMultiplier = calculateGrowthMultiplier(currentAbility)
            const focusMultiplier = focusMultipliers[key] || 1.0
            const actualIncrease = Math.max(1, Math.floor(baseIncrease * growthMultiplier * focusMultiplier))

            ;(emp.abilities as any)[key] = Math.min(100, currentAbility + actualIncrease)
            totalGrowth += actualIncrease
        })

        const avgGrowth = Math.floor(totalGrowth / 4)

        // 研修によるスキルポイント獲得
        const earnedPoints = Math.max(1, Math.floor(avgGrowth / 3))
        emp.skillPoints = (emp.skillPoints || 0) + earnedPoints

        // 成長履歴に記録
        const focusNames: Record<string, string> = {
            'balanced': 'バランス型',
            'technical': '技術力特化',
            'sales': '営業力特化',
            'planning': '企画力特化',
            'management': '管理力特化'
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

    return {
        success: true,
        cost,
        growthDetails,
        bonusMessages,
        focusType
    }
}
